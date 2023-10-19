/**
 * FeaturePath: 個案管理-服務流程管理-暫停結案-v25排班刪除
 * FeaturePath: 個案管理-服務流程管理-暫停結案-v25排班請假
 * FeaturePath: 個案管理-服務流程管理-暫停結案-v25排班銷假
 * FeaturePath: 個案管理-服務流程管理-暫停結案-v25查詢服務記錄
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-status-history-tov25-service.js
 * Project: @erpv3/app-core
 * File Created: 2022-11-03 04:31:21 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');
const { models } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const conf = require('@erpv3/app-common/shared/config');
const { LunaServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const { coreErrorCodes, companyServiceCodes, caseServiceStatusCodes } = require('../../domain');
const { v25Map, getStringValue } = require('../../domain/enums/mapping');

const DayRangeLimit = 180;
const { HOST, KEY } = conf.LUNA;
const { LunaServiceClass, LunaApi } = LunaServiceClient;
class CaseStatusHistoryTo25Service {
  /**
   * v2.5 排班刪除
   * @param {String} cookie cookie
   * @param {String} companyId 公司Id
   * @param {String} caseId 個案Id
   * @param {String} service 服務類型 companyServiceCodes
   * @param {Number} status caseServiceStatusCodes
   * @param {Date} startDate 開始日期
   * @param {Date} endDate 結束日期
   * @returns Object
   */
  static async delete(cookie, companyId, caseId, service, status, startDate, endDate = null) {
    const obj = {
      companyId,
      caseId,
    };
    const _service = service.toUpperCase();
    const v25StartDate = startDate.replaceAll('/', '-');
    const v25EndDate = (endDate && CustomValidator.nonEmptyString(endDate)) ? endDate.replaceAll('/', '-') : null;

    let dataRes = null;
    if (_service === companyServiceCodes.DC && status === caseServiceStatusCodes.closed) {
      // 日照結案
      obj.closedDate = v25StartDate;
      dataRes = await LunaServiceClass.setFromWebAPI(HOST, KEY, cookie, obj, LunaApi.DeleteDaycaseScheduleByClosed.key);
    } else if (_service === companyServiceCodes.DC && status === caseServiceStatusCodes.pending) {
      // 日照暫停
      if (v25EndDate) {
        // 有結束日期
        obj.pendingStartDate = v25StartDate;
        obj.pendingEndDate = v25EndDate;
        dataRes = await LunaServiceClass.setFromWebAPI(HOST, KEY, cookie, obj, LunaApi.DeleteDaycaseScheduleByPending.key);
      } else {
        // 無結束日期
        obj.pendingStartDate = v25StartDate;
        dataRes = await LunaServiceClass.setFromWebAPI(HOST, KEY, cookie, obj, LunaApi.DeleteDaycaseScheduleByPending.key);
      }
      return null;
    } else if (_service === companyServiceCodes.HC && status === caseServiceStatusCodes.closed) {
      // 居服結案
      obj.closedDate = v25StartDate;
      dataRes = await LunaServiceClass.setFromWebAPI(HOST, KEY, cookie, obj, LunaApi.DeleteCaseScheduleByClosed.key);
    } else if (_service === companyServiceCodes.HC && status === caseServiceStatusCodes.pending) {
      // 居服暫停
      if (v25EndDate) {
        // 有結束日期
        obj.serviceStartDate = v25StartDate;
        obj.serviceEndDate = v25EndDate;
        dataRes = await LunaServiceClass.setFromWebAPI(HOST, KEY, cookie, obj, LunaApi.DeleteCaseScheduleByPendingRange.key);
      } else {
        // 無結束日期
        obj.pendingDate = v25StartDate; // pendingStartDate
        dataRes = await LunaServiceClass.setFromWebAPI(HOST, KEY, cookie, obj, LunaApi.DeleteCaseScheduleByPending.key);
      }
    } else {
      return null;
    }

    if (!dataRes) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
    const { success, data } = dataRes;
    if (!success) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
    return data;
  }

  /**
   * v2.5 排班請假
   * @param {String} cookie cookie
   * @param {String} companyId 公司Id
   * @param {String} caseId 個案Id
   * @param {String} service 服務類型 companyServiceCodes
   * @param {Date} startDate 開始日期
   * @param {Date} endDate 結束日期
   * @returns Object
   */
  static async leave(cookie, companyId, caseId, service, startDate, endDate) {
    const obj = {
      companyId,
      caseId,
      pendingStartDate: startDate.replaceAll('/', '-'),
      pendingEndDate: endDate.replaceAll('/', '-'),
    };
    const _service = service.toUpperCase();

    let dataRes = null;
    if (_service === companyServiceCodes.DC) {
      // 日照請假
      dataRes = await LunaServiceClass.setFromWebAPI(HOST, KEY, cookie, obj, LunaApi.SetDaycaseScheduleLeaveByPendingRange.key);
    } else if (_service === companyServiceCodes.HC) {
      // 居服請假
      dataRes = await LunaServiceClass.setFromWebAPI(HOST, KEY, cookie, obj, LunaApi.SetCaseScheduleLeaveByPendingRange.key);
    } else {
      return null;
    }

    if (!dataRes) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
    const { success, data } = dataRes;
    if (!success) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
    return data;
  }

  /**
   * v2.5 排班銷假
   * @param {String} cookie cookie
   * @param {String} companyId 公司Id
   * @param {String} caseId 個案Id
   * @param {String} service 服務類型 companyServiceCodes
   * @param {Date} startDate 開始日期
   * @param {Date} endDate 結束日期
   * @returns Object
   */
  static async cancelLeave(cookie, companyId, caseId, service, startDate, endDate = null) {
    const obj = {
      companyId,
      caseId,
      recoverStartDate: startDate.replaceAll('/', '-'),
    };
    obj.recoverEndDate = (endDate && CustomValidator.nonEmptyString(endDate)) ? endDate.replaceAll('/', '-') : moment(startDate, 'YYYY/MM/DD').add(DayRangeLimit, 'days').format('YYYY-MM-DD');
    const _service = service.toUpperCase();

    let dataRes = null;
    if (_service === companyServiceCodes.DC) {
      // 日照恢復排班
      dataRes = await LunaServiceClass.setFromWebAPI(HOST, KEY, cookie, obj, LunaApi.SetDaycaseScheduleCancelLeaveByPendingRange.key);
    } else if (_service === companyServiceCodes.HC) {
      // 居服恢復排班
      dataRes = await LunaServiceClass.setFromWebAPI(HOST, KEY, cookie, obj, LunaApi.SetCaseScheduleCancelLeaveByPendingRange.key);
    } else {
      return null;
    }

    if (!dataRes) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
    const { success, data } = dataRes;
    if (!success) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
    return data;
  }

  /**
   * v2.5 查詢是否有服務紀錄
   * @param {String} cookie cookie
   * @param {String} companyId 公司Id
   * @param {String} caseId 個案Id
   * @param {String} service 服務類型 companyServiceCodes
   * @param {Date} startDate 開始日期
   * @param {Date} endDate 結束日期
   * @returns Number
   */
  static async countServiceRecord(cookie, companyId, caseId, service, startDate, endDate) {
    service = service.toUpperCase();
    const obj = {
      companyId,
      caseId,
      caseType: getStringValue(v25Map.caseTypeMaps, service),
      startDate: startDate.replaceAll('/', '-'),
    };
    if (endDate && CustomValidator.nonEmptyString(endDate)) { obj.endDate = endDate.replaceAll('/', '-'); }

    let dataRes = null;
    if (service === companyServiceCodes.DC) {
      dataRes = await LunaServiceClass.setFromWebAPI(HOST, KEY, cookie, obj, LunaApi.ReadDaycaseServiceRecordCount.key);
    } else if (service === companyServiceCodes.HC) {
      dataRes = await LunaServiceClass.setFromWebAPI(HOST, KEY, cookie, obj, LunaApi.ReadCaseServiceRecordCount.key);
    }

    if (!dataRes) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
    const { success, data } = dataRes;
    if (!success) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
    return CustomValidator.isNumber(data.count) ? data.count : null;
  }
}

module.exports = CaseStatusHistoryTo25Service;
