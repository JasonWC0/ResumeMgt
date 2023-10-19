/**
 * FeaturePath: 個案管理-計畫-照顧計畫-新增照顧計畫
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-tov25-service.js
 * Project: @erpv3/app-core
 * File Created: 2022-12-16 02:22:56 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const conf = require('@erpv3/app-common/shared/config');
const { models } = require('@erpv3/app-common');
const { LunaServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const { v25Map, getStringValue } = require('../../domain/enums/mapping');
const { coreErrorCodes, companyServiceCodes } = require('../../domain');

const { HOST, KEY } = conf.LUNA;
const { LunaServiceClass, LunaApi } = LunaServiceClient;

class CaseToV25Service {
  /**
   * 取得個案資料
   * @param {Object} cookie cookie
   * @param {String} companyId 機構Id
   * @param {String} caseId 個案Id
   * @param {String} serviceType 服務類型 companyServiceCodes
   * @returns {Object} 個案資料
   */
  static async getCaseInfo(cookie, companyId, caseId, serviceType) {
    const obj = {
      companyId,
      _id: caseId,
    };

    let response = null;
    switch (serviceType) {
      case companyServiceCodes.HC:
        response = await LunaServiceClass.normalAPI(HOST, KEY, cookie, obj, LunaApi.ReadCaseProfile.key);
        break;
      case companyServiceCodes.DC:
        response = await LunaServiceClass.normalAPI(HOST, KEY, cookie, obj, LunaApi.ReadDaycaseProfile.key);
        break;
      default:
        break;
    }
    if (!response) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
    const { success, data } = response;
    if (!success) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
    return data;
  }

  /**
   * 於v25建立表單結果
   * @param {Object} cookie cookie
   * @param {String} companyId 機構Id
   * @param {String} caseId 個案Id
   * @param {String} formType 表單類型
   * @param {Date} evaluateDate 評估日期(填表日期)
   * @param {Object} result 表單結果內容
   */
  static async createFormResult(cookie, companyId, caseId, formType, evaluateDate, result) {
    // 取得機構表單範本資料
    const formProfObj = {
      companyId,
      code: getStringValue(v25Map.formTypeMaps, formType),
    };
    const formProfile = await LunaServiceClass.normalAPI(HOST, KEY, cookie, formProfObj, LunaApi.ReadFormProfile.key);
    if (!formProfile) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
    const { success, data } = formProfile;
    if (!success) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
    const { _id, category } = data?.current; // 目前使用範本

    // 建立個案表單結果
    const obj = {
      companyId,
      caseId,
      category,
      code: getStringValue(v25Map.formTypeMaps, formType),
      formId: _id,
      result,
      fillDate: evaluateDate,
      fileFields: [],
      nextFillDate: '',
      nodeUpdateStatus: 'STATUS_FORM_IN_NODE_NO_FLOW',
    };
    const formResult = await LunaServiceClass.normalAPI(HOST, KEY, cookie, obj, LunaApi.CreateFormResult.key);
    if (!formResult || !formResult.success) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
  }

  /**
   * 取得表單結果列表
   * @param {Object} cookie cookie
   * @param {String} companyId 機構Id
   * @param {String} caseId 個案Id
   * @param {String} formType 表單類型
   * @returns {Array} 表單結果列表
   */
  static async getFromResults(cookie, companyId, caseId, formType) {
    const query = {
      companyId,
      caseId,
      code: getStringValue(v25Map.formTypeMaps, formType),
    };
    const formResultList = await LunaServiceClass.normalAPI(HOST, KEY, cookie, query, LunaApi.ReadFromResultList.key);
    if (!formResultList || !formResultList.success) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
    const { data } = formResultList;
    return data;
  }
}

module.exports = CaseToV25Service;
