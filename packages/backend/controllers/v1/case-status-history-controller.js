/* eslint-disable array-callback-return */
/* eslint-disable object-curly-newline */
/* eslint-disable no-lonely-if */
/* eslint-disable newline-per-chained-call */
/**
 * FeaturePath: 個案管理-服務流程管理-暫停結案-CRUD
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-status-history-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-10-04 10:33:17 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models } = require('@erpv3/app-common');
const conf = require('@erpv3/app-common/shared/config');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { SideAServiceClass, SideAApi } = require('@erpv3/app-common/shared/connection-clients').SideAServiceClient;
const { CreateCaseStatusRequest, UpdateCaseStatusRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { CaseStatusHistoryService, CaseStatusHistoryToV25Service } = require('@erpv3/app-core/application/service');
const { CaseServiceStatusRecordObject, coreErrorCodes, caseServiceStatusCodes, casePendingChangeScheduleTypeCodes, companyServiceCodes } = require('@erpv3/app-core/domain');
const { CaseStatusHistoryRepository, CaseRepository } = require('@erpv3/app-core/infra/repositories');
const CaseStatusHistoryListResponse = require('./res-objects/case-status-history-list-response');

/**
 * 更新個案資料的結案日期
 * @param {String} caseId 個案Id
 * @param {String} service 服務類型 companyServiceCodes
 * @param {Number} status 個案狀態 caseServiceStatusCodes
 * @param {Date} date 日期
 */
async function _updateCaseServiceEndDate(caseId, service, status, date) {
  const obj = {};
  if (CustomValidator.isEqual(status, caseServiceStatusCodes.closed)) {
    obj[`${service}.endDate`] = date;
  } else {
    obj[`${service}.endDate`] = null;
  }
  await CaseRepository.updateById(caseId, obj);
}

/**
 * 更新v2.5排班紀錄
 * @param {String} cookie cookie
 * @param {String} companyId 機構Id
 * @param {String} caseId 個案Id
 * @param {String} service 服務類型 companyServiceCodes
 * @param {Number} status 個案狀態 caseServiceStatusCodes
 * @param {Date} startDate 開始日期
 * @param {Date} endDate 結束日期
 * @param {Number} pendingType 暫停類型 casePendingChangeScheduleTypeCodes
 */
async function _updateV25ShiftSchedule(cookie, companyId, caseId, service, status, startDate, endDate = null, pendingType = null) {
  switch (status) {
    case caseServiceStatusCodes.closed:
      await CaseStatusHistoryToV25Service.delete(cookie, companyId, caseId, service, status, startDate);
      break;
    case caseServiceStatusCodes.pending:
      if (casePendingChangeScheduleTypeCodes.delete === pendingType) {
        await CaseStatusHistoryToV25Service.delete(cookie, companyId, caseId, service, status, startDate, endDate);
      } else if (casePendingChangeScheduleTypeCodes.leave === pendingType) {
        await CaseStatusHistoryToV25Service.leave(cookie, companyId, caseId, service, startDate, endDate);
      }
      break;
    case caseServiceStatusCodes.service:
      await CaseStatusHistoryToV25Service.cancelLeave(cookie, companyId, caseId, service, startDate, endDate);
      break;
    default:
      break;
  }
}

class CaseStatusHistoryController {
  /**
   * 建立個案狀態
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async create(ctx, next) {
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;
    const { cookie } = ctx.request.headers;
    const _companyId = ctx.state.baseInfo.companyId;
    const token = ctx.state.tokenKey;
    const mReq = new CreateCaseStatusRequest().bind(ctx.request.body).checkRequired().serviceToLowerCase().checkReturnService();
    const caseServiceStatusObj = new CaseServiceStatusRecordObject().bind(mReq).withDate(mReq.startDate).withPendingType(mReq.changeSchedule).genCreatedAt().genUpdatedAt();
    const reOnServiceObj = mReq.returnServiceDate ? new CaseServiceStatusRecordObject().withDate(mReq.returnServiceDate).withStatus(caseServiceStatusCodes.service).genCreatedAt().genUpdatedAt() : null;

    // find case
    const caseEntity = await CaseRepository.findCase(mReq.caseId);
    const { companyId } = caseEntity;

    // 若建立為"非住宿式"的暫停(請假)，v25 不可有服務紀錄
    if (!CustomValidator.isEqual(mReq.oriService, companyServiceCodes.RC) && CustomValidator.isEqual(mReq.status, caseServiceStatusCodes.pending) && CustomValidator.isEqual(mReq.changeSchedule, casePendingChangeScheduleTypeCodes.leave)) {
      const count = await CaseStatusHistoryToV25Service.countServiceRecord(cookie, companyId, mReq.caseId, mReq.service, mReq.startDate, mReq.endDate);
      if (count === null || count !== 0) { throw new models.CustomError(coreErrorCodes.ERR_CASE_SERVICE_RECORD_EXIST); }
    }

    // create case status
    const callShiftSchedule = await CaseStatusHistoryService.create(mReq.caseId, mReq.service, caseServiceStatusObj, reOnServiceObj, { __cc, __sc }, personId);

    // Update v25 ("非住宿式")
    if (!CustomValidator.isEqual(mReq.oriService, companyServiceCodes.RC) && callShiftSchedule) {
      await _updateV25ShiftSchedule(cookie, companyId, mReq.caseId, mReq.service, mReq.status, mReq.startDate, mReq.endDate, mReq.changeSchedule);
    }

    // 若建立為"住宿式"的結案，呼叫sideA床位退住
    if (CustomValidator.isEqual(mReq.oriService, companyServiceCodes.RC) && CustomValidator.isEqual(mReq.status, caseServiceStatusCodes.closed)) {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        sc: 'ERPv3',
        companyId: _companyId,
      };
      // 先取得床位紀錄
      const caseBedBookRes = await SideAServiceClass.callNormalAPI(conf.SIDEA.HOST, headers, SideAApi.ReadCaseBedBookList.key, {}, { '{caseId}': mReq.caseId });
      const bedBookList = caseBedBookRes.result;
      if (CustomValidator.nonEmptyArray(bedBookList)) {
        // filter 1.有checkin 2.沒有endDate
        const theBooks = bedBookList.filter((d) => d.checkin === true && [null, '', undefined].includes(d.endDate)).map((d) => d.bookId);
        // 依照bookId退住
        await Promise.all(theBooks.map((bookId) => {
          SideAServiceClass.callNormalAPI(conf.SIDEA.HOST, headers, SideAApi.CheckOutBedBook.key, { date: mReq.startDate }, { '{bookId}': bookId });
        }));
      }
    }

    ctx.state.result = new models.CustomResult();
    await next();
  }

  /**
   * 讀取個案歷史狀態列表
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async readList(ctx, next) {
    const { caseId } = ctx.request.query;
    const caseStatusRes = await CaseStatusHistoryRepository.findByCaseId(caseId);
    if (caseStatusRes) {
      caseStatusRes.sortByDate();
    }

    const response = new CaseStatusHistoryListResponse();
    response.hc = (caseStatusRes && CustomValidator.nonEmptyArray(caseStatusRes.hc)) ? caseStatusRes.hc : [];
    response.dc = (caseStatusRes && CustomValidator.nonEmptyArray(caseStatusRes.dc)) ? caseStatusRes.dc : [];
    response.rc = (caseStatusRes && CustomValidator.nonEmptyArray(caseStatusRes.rc)) ? caseStatusRes.rc : [];
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  /**
   * 變更個案歷史狀態
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async update(ctx, next) {
    const { caseStatusHistoryId } = ctx.params;
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new UpdateCaseStatusRequest().bind(ctx.request.body).checkRequired().serviceToLowerCase();

    const caseStatusRes = await CaseStatusHistoryRepository.findByCaseId(mReq.caseId);
    if (!caseStatusRes || !CustomValidator.nonEmptyArray(caseStatusRes[mReq.service]) || !caseStatusRes[mReq.service].some((s) => s.id === caseStatusHistoryId)) { throw new models.CustomError(coreErrorCodes.ERR_CASE_STATUS_RECORD_NOT_EXIST); }

    // 變更個案狀態歷史紀錄
    await CaseStatusHistoryService.update(caseStatusRes, caseStatusHistoryId, mReq, { __cc, __sc }, personId);

    ctx.state.result = new models.CustomResult();
    await next();
  }

  /**
   * 刪除個案歷史狀態
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async delete(ctx, next) {
    const { caseStatusHistoryId } = ctx.params;
    const { caseId, service } = ctx.request.query;
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;

    if (!caseId) { throw new models.CustomError(coreErrorCodes.ERR_CASE_ID_IS_EMPTY); }
    if (!service || !Object.keys([caseServiceStatusCodes.service, caseServiceStatusCodes.pending, caseServiceStatusCodes.closed].includes(service))) { throw new models.CustomError(coreErrorCodes.ERR_CASE_SERVICE_STATUS_WRONG_VALUE); }
    const _service = service.toLowerCase();

    const caseStatusRes = await CaseStatusHistoryRepository.findByCaseId(caseId);
    if (!caseStatusRes || !CustomValidator.nonEmptyArray(caseStatusRes[_service]) || !caseStatusRes[_service].some((s) => s.id === caseStatusHistoryId)) { throw new models.CustomError(coreErrorCodes.ERR_CASE_STATUS_RECORD_NOT_EXIST); }
    caseStatusRes.sortByDate();
    await CaseStatusHistoryRepository.deleteStatusRecord(caseId, _service, caseStatusHistoryId, { __cc, __sc }, personId);

    let updateCase = null;
    caseStatusRes[_service].forEach((s, index) => {
      // If the one deleted is the 1st-New => Use the 2nd-New to update case info
      if (CustomValidator.isEqual(s.id, caseStatusHistoryId) && index === 0) {
        updateCase = {
          status: caseStatusRes[_service][1] ? caseStatusRes[_service][1].status : caseServiceStatusCodes.service,
          endDate: caseStatusRes[_service][1] ? caseStatusRes[_service][1].date : null,
        };
      }
    });

    // Update Case Service endDate
    if (updateCase) {
      await _updateCaseServiceEndDate(caseId, _service, updateCase.status, updateCase.endDate);
    }
    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = CaseStatusHistoryController;
