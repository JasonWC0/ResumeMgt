/**
 * FeaturePath: 經營管理-財會-個案帳務管理-個案關帳管理
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-close-account-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-12-04 09:22:25 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const moment = require('moment');
const conf = require('@erpv3/app-common/shared/config');
const { ReadCaseCloseAccountListRequest, UpdateCaseCloseAccountRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { models } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { caseCloseAccountStatusCodes, coreErrorCodes } = require('@erpv3/app-core/domain');
const { DecryptionPersonService, CarePlanService } = require('@erpv3/app-core/application/service');
const { LunaServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const coreRepo = require('@erpv3/app-core/infra/repositories');
const reqObjs = require('@erpv3/app-core/application/contexts/req-objects');
const companyServiceCodes = require('@erpv3/app-core/domain/enums/company-service-codes');
const CaseCloseAccountListResponse = require('./res-objects/case-close-account-list-response');

/**
 * 整合個案列表資料與關帳資訊
 * @param {object[]} caseList 個案列表
 * @param {object[]} closeAccountSettings 關帳設定
 * @param {string} year 年份
 * @param {string} month 月份
 * @param {string} serviceCategory 服務類型 (Ex:"HC,DC,RC")
 * @returns {Promise.<object[]>} 回傳結果
 */
async function integrateCaseInfoWithCloseAccountSetting(caseList, closeAccountSettings, year, month, serviceCategory) {
  const resArray = [];
  const serviceCategories = serviceCategory.split(',');
  const momentMonth = Number(month) - 1;
  const _date = moment().set({ year, month: momentMonth }).toDate();
  const startOfMonth = moment(_date).startOf('month').toDate();
  const endOfMonth = moment(_date).endOf('month').toDate();
  if (Array.isArray(caseList) && caseList.length > 0) {
    for await (const _case of caseList) {
      const caseId = _case._id;
      // 取得該月最新一般照顧計畫
      const carePlan = await CarePlanService.findeNewestOneByMonth(caseId, year, month);
      // 個案姓名
      const name = await DecryptionPersonService.getName(_case.personInfo?._id);
      // 身分證字號
      const personalId = await DecryptionPersonService.getPersonalId(_case.personInfo?._id);
      // 地區
      const area = `${_case.personInfo?.residencePlace?.city || ''}${_case.personInfo?.residencePlace?.region || ''}`;
      // 關帳狀態
      const status = caseCloseAccountStatusCodes.unclosed;

      const obj = {
        caseId, // 個案ID
        gender: _case.personInfo?.gender, // 性別
        personalId, // 身分證字號
        area, // 地區
        reliefType: carePlan?.reliefType, // 身份別
        status, // 關帳狀態
        name, // 個案名稱
      };
      const { hc, dc, rc } = _case;

      // 取得[居家]服務相關資訊
      if (CustomValidator.nonEmptyObject(hc) && hc.valid) {
        const { supervisorId, masterHomeservicerId } = hc;
        // 主責督導員
        if (supervisorId) {
          obj.supervisorName = await DecryptionPersonService.getName(supervisorId);
        }
        // 主責居服員
        if (masterHomeservicerId) {
          obj.masterHomeservicerName = await DecryptionPersonService.getName(masterHomeservicerId);
        }
      }
      // 紀錄個案的服務資訊
      const serviceInfos = [];
      if (hc && serviceCategories.includes(companyServiceCodes.HC)) serviceInfos.push({ code: companyServiceCodes.HC, startDate: hc.startDate, endDate: hc.endDate });
      if (dc && serviceCategories.includes(companyServiceCodes.DC)) serviceInfos.push({ code: companyServiceCodes.DC, startDate: dc.startDate, endDate: dc.endDate });
      if (rc && serviceCategories.includes(companyServiceCodes.RC)) serviceInfos.push({ code: companyServiceCodes.RC, startDate: rc.startDate, endDate: rc.endDate });

      for (const serviceInfo of serviceInfos) {
        const { code, startDate, endDate } = serviceInfo;
        // 服務開始日在當月最後一天(含)以前
        const caseStartDateIsBeforeMonthEnd = moment(startDate, 'YYYY-MM-DD').isSameOrBefore(endOfMonth);
        // 服務結束日在當月的第一天(含)以後
        const caseEndDateIsAfterMonthStart = (endDate) ? moment(endDate, 'YYYY-MM-DD').isSameOrAfter(startOfMonth) : true;
        // 若於本月無服務，則略過
        if (!caseStartDateIsBeforeMonthEnd || !caseEndDateIsAfterMonthStart) {
          continue;
        }

        let isUnclosed = true; // 是否尚未關帳
        obj.startDate = startDate;
        obj.endDate = endDate;
        const cloneObj = { ...obj };
        cloneObj.serviceCategory = code;
        if (Array.isArray(closeAccountSettings) && closeAccountSettings.length > 0) {
          const setting = closeAccountSettings.find((_setting) => _setting.caseId === caseId.toString() && _setting.serviceCategory === code);
          if (setting) {
            isUnclosed = false;
            cloneObj.status = caseCloseAccountStatusCodes.closed;
            cloneObj.memo = setting.memo;

            resArray.push(cloneObj);
          }
        }
        if (isUnclosed) {
          resArray.push(cloneObj);
        }
      }
    }
  }
  return resArray;
}

class CaseCloseAccountController {
  /**
   * 讀取個案關帳列表
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async readList(ctx, next) {
    const mReq = new ReadCaseCloseAccountListRequest().bind(ctx.request.query).checkRequired();
    const { year, month, serviceCategory } = mReq;
    const { companyId } = ctx.state.baseInfo;

    // 準備呼叫v2 API所需的資料
    const { HOST, KEY } = conf.LUNA;
    const { cookie } = ctx.request.headers;
    const { LunaServiceClass, LunaApi } = LunaServiceClient;
    const body = {
      companyId,
      year,
      month,
    };

    // 呼叫v2 API取得關帳資訊
    const dataRes = await LunaServiceClass.setFromWebAPI(HOST, KEY, cookie, body, LunaApi.ReadCaseCloseAccountSettings.key);
    const closeAccountSettings = dataRes.data;

    // 取得個案列表資料
    const mCaseReq = new reqObjs.ReadCaseListRequest()
      .bind(ctx.request.query)
      .checkRequired();
    const caseList = await coreRepo.CaseRepository.findCaseList(companyId, mCaseReq);

    // 整合個案列表資料與關帳資訊
    const caseCloseAccountRes = await integrateCaseInfoWithCloseAccountSetting(caseList, closeAccountSettings, year, month, serviceCategory);

    // 回傳結果
    const response = new CaseCloseAccountListResponse();
    response.data = caseCloseAccountRes;
    response.total = caseCloseAccountRes.length;
    ctx.state.result = new models.CustomResult().withResult(response.toView());

    await next();
  }

  /**
   * 更新個案關帳設定
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async updateSettings(ctx, next) {
    const mReq = new UpdateCaseCloseAccountRequest().bind(ctx.request.body).checkRequired();
    const {
      year, month, cases, status,
    } = mReq;
    const { companyId } = ctx.state.baseInfo;

    // 準備呼叫v2 API所需的資料
    const { HOST, KEY } = conf.LUNA;
    const { cookie } = ctx.request.headers;
    const { LunaServiceClass, LunaApi } = LunaServiceClient;
    const body = {
      companyId,
      year,
      month,
      cases,
      status,
    };

    // 呼叫v2 API設定關帳資訊
    const dataRes = await LunaServiceClass.setFromWebAPI(HOST, KEY, cookie, body, LunaApi.SetCaseCloseAccountSettings.key);
    if (!dataRes) {
      throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL);
    }
    const { success } = dataRes;
    if (!success) {
      throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL);
    }

    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = CaseCloseAccountController;
