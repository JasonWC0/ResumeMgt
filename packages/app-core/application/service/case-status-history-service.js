/* eslint-disable newline-per-chained-call */
/**
 * FeaturePath: 個案管理-服務流程管理-暫停結案-增改
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-status-history-service.js
 * Project: @erpv3/app-core
 * File Created: 2022-11-17 04:16:36 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');
const { models, codes, LOGGER } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { CaseStatusHistoryRepository, CaseRepository } = require('../../infra/repositories');
const {
  coreErrorCodes, caseServiceStatusCodes, casePendingChangeScheduleTypeCodes, CaseStatusHistoryEntity,
} = require('../../domain');

/**
 * 更新個案資料的結案日期
 * @param {String} caseId 個案Id
 * @param {String} service 服務類型 companyServiceCodes
 * @param {Number} status 個案狀態 caseServiceStatusCodes
 * @param {Date} date 日期
 */
async function _updateCaseServiceEndDate(caseId, service, status, date, session = null) {
  const obj = {};
  if (CustomValidator.isEqual(status, caseServiceStatusCodes.closed)) {
    obj[`${service}.endDate`] = date;
  } else {
    obj[`${service}.endDate`] = null;
  }
  await CaseRepository.updateById(caseId, obj, session);
}

class CaseStatusHistoryService {
  /**
   * 新增個案服務歷史狀態
   * @param {String} caseId 個案Id
   * @param {String} service 服務
   * @param {CaseServiceStatusRecordObject} toStatusObj 服務狀態物件
   * @param {CaseServiceStatusRecordObject} reOnServiceStatusObj 恢復服務狀態物件
   * @param {Object} baseInfo { __cc, __sc }
   * @param {String} personId 操作者人員Id
   * @returns {Boolean} callShiftSchedule 是否更新2.5班表
   */
  static async create(caseId, service, toStatusObj, reOnServiceStatusObj = null, baseInfo = {}, personId = '') {
    let session = null;
    try {
      // 是否更新2.5班表
      let callShiftSchedule = true;
      session = await DefaultDBClient.takeConnection().startSession();
      await session.withTransaction(async () => {
        const caseStatusExist = await CaseStatusHistoryRepository.findByCaseId(caseId);
        // 個案狀態存在與否: true(update該筆資料的服務列表), false(create個案歷史紀錄資料)
        if (caseStatusExist) {
          // 個案狀態在指定服務無紀錄預設為空陣列
          if (!caseStatusExist[service] || !CustomValidator.nonEmptyArray(caseStatusExist[service])) {
            caseStatusExist[service] = [];
          } else {
            caseStatusExist.sortByDate();
            const theNewest = caseStatusExist[service][0];
            // the date can't before the newest record's date
            if (moment(toStatusObj.date, 'YYYY/MM/DD').isBefore(moment(theNewest.date))) { throw new models.CustomError(coreErrorCodes.ERR_CASE_STATUS_RECORD_DATE_WRONG); }
            // 若為恢復服務，確認上一筆是否為暫停且非刪除班(為請假)
            if (toStatusObj.statue === caseServiceStatusCodes.service
              && theNewest.status === caseServiceStatusCodes.pending
              && theNewest.pendingType !== casePendingChangeScheduleTypeCodes.delete) {
              callShiftSchedule = false;
            }
          }
          caseStatusExist[service].push(toStatusObj);

          // 若有恢復服務加入資料
          if (reOnServiceStatusObj) {
            caseStatusExist[service].push(reOnServiceStatusObj);
          }
          caseStatusExist.bindModifier(personId).bindBaseInfo(baseInfo);
          await CaseStatusHistoryRepository.updateByCaseId(caseStatusExist, session);
        } else {
          const caseStatusEntity = new CaseStatusHistoryEntity().bind({ caseId }).bindCreator(personId).bindModifier(personId).bindBaseInfo(baseInfo);
          caseStatusEntity[service] = [toStatusObj];
          if (reOnServiceStatusObj) {
            caseStatusEntity[service].push(reOnServiceStatusObj);
          }
          await CaseStatusHistoryRepository.create(caseStatusEntity, session);
        }

        // Update Case Service endDate 更新個案結案日期
        if (!reOnServiceStatusObj) {
          await _updateCaseServiceEndDate(caseId, service, toStatusObj.status, toStatusObj.date);
        } else {
          await _updateCaseServiceEndDate(caseId, service, reOnServiceStatusObj.status, reOnServiceStatusObj.date);
        }
      });
      session.endSession();
      return callShiftSchedule;
    } catch (ex) {
      if (session) { session.endSession(); }
      if (ex.constructor === new models.CustomError().constructor) { throw ex; }
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * 更新個案服務歷史紀錄
   * @param {CaseStatusHistoryEntity} caseStatusHistEntity 個案原有服務紀錄資料
   * @param {String} id 服務歷史紀錄的Id
   * @param {UpdateCaseServiceRequest} reqObj 更新資料
   * @param {String} reqObj.caseId 個案Id
   * @param {String} reqObj.service 服務類型
   * @param {String} reqObj.date 日期
   * @param {String} reqObj.reason 原因
   * @param {String} reqObj.memo 備註
   * @param {Object} baseInfo { __cc, __sc }
   * @param {String} personId 操作者人員Id
   */
  static async update(caseStatusHistEntity, id, reqObj, baseInfo = {}, personId = '') {
    let session = null;
    try {
      session = await DefaultDBClient.takeConnection().startSession();
      await session.withTransaction(async () => {
        let theRecord;
        let updateCase = false;
        caseStatusHistEntity.sortByDate(); // new to old
        caseStatusHistEntity[reqObj.service].forEach((s, index) => {
          if (CustomValidator.isEqual(s.id, id)) {
            // the date can't before the previous record's date
            if (caseStatusHistEntity[reqObj.service][index + 1] && moment(reqObj.date, 'YYYY/MM/DD').isBefore(moment(caseStatusHistEntity[reqObj.service][index + 1].date))) {
              throw new models.CustomError(coreErrorCodes.ERR_CASE_STATUS_RECORD_DATE_WRONG);
            }
            // the date can't after the next record's date
            if (caseStatusHistEntity[reqObj.service][index - 1] && moment(reqObj.date, 'YYYY/MM/DD').isAfter(moment(caseStatusHistEntity[reqObj.service][index - 1].date))) {
              throw new models.CustomError(coreErrorCodes.ERR_CASE_STATUS_RECORD_DATE_WRONG);
            }

            theRecord = s;
            theRecord.bind({ date: reqObj.date, memo: reqObj.memo });
            if (CustomValidator.isEqual(s.status, caseServiceStatusCodes.closed)) {
              reqObj.checkClosedRequired();
              theRecord.reason = reqObj.reason;
              if (index === 0) { updateCase = true; }
            }
          }
        });
        // Update Case Status
        await CaseStatusHistoryRepository.updateStatusRecord(reqObj.caseId, reqObj.service, theRecord, baseInfo, personId, session);

        // Update Case Service endDate
        if (updateCase) {
          await _updateCaseServiceEndDate(reqObj.caseId, reqObj.service, caseServiceStatusCodes.closed, reqObj.date, session);
        }
      });
      session.endSession();
    } catch (ex) {
      if (session) { session.endSession(); }
      if (ex.constructor === new models.CustomError().constructor) { throw ex; }
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = CaseStatusHistoryService;
