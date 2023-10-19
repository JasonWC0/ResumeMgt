/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-case-status-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-04 11:06:58 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex, CustomUtils } = require('@erpv3/app-common/custom-tools');
const {
  coreErrorCodes,
  companyServiceCodes,
  caseServiceStatusCodes,
  caseClosedReasonCodes,
  casePendingChangeScheduleTypeCodes,
} = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class CreateCaseStatusRequest extends BaseBundle {
  /**
* @constructor
*/
  constructor() {
    super();
    /**
     * @type {string} caseId
     * @description 個案Id
     * @member
     */
    this.caseId = '';
    /**
     * @type {string} service
     * @description 服務類型
     * @member
     */
    this.service = '';
    /**
     * @type {string} startDate
     * @description 開始日期
     * @member
     */
    this.startDate = '';
    /**
     * @type {string} endDate
     * @description 結束日期
     * @member
     */
    this.endDate = '';
    /**
     * @type {number} status
     * @description 狀態
     * @member
     */
    this.status = null;
    /**
     * @type {number} reason
     * @description 原因
     * @member
     */
    this.reason = null;
    /**
     * @type {number} changeSchedule
     * @description 排班變更
     * @member
     */
    this.changeSchedule = null;
    /**
     * @type {string} memo
     * @description 備註
     * @member
     */
    this.memo = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  serviceToLowerCase() {
    this.oriService = CustomUtils.deepCopy(this.service);
    this.service = this.service.toLowerCase();
    return this;
  }

  checkReturnService() {
    this.endDate = (CustomValidator.nonEmptyString(this.endDate)) ? this.endDate : null;
    this.returnServiceDate = (CustomValidator.nonEmptyString(this.endDate)) ? moment(this.endDate, 'YYYY/MM/DD').add(1, 'days').toDate() : null;
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.caseId, coreErrorCodes.ERR_CASE_ID_IS_EMPTY)
      .checkThrows(this.service,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_SERVICE_CATEGORY_IS_EMPTY },
        { fn: (val) => Object.values(companyServiceCodes).includes(val), m: coreErrorCodes.ERR_SERVICE_WRONG_VALUE })
      .checkThrows(this.startDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_START_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT })
      .checkThrows(this.status,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_CASE_SERVICE_STATUS_IS_EMPTY },
        { fn: (val) => Object.values([caseServiceStatusCodes.service, caseServiceStatusCodes.closed, caseServiceStatusCodes.pending]).includes(val), m: coreErrorCodes.ERR_CASE_SERVICE_STATUS_WRONG_VALUE });

    if (CustomValidator.nonEmptyString(this.endDate)) {
      new CustomValidator()
        .checkThrows(this.endDate,
          { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT });
    }
    if (CustomValidator.isEqual(this.status, caseServiceStatusCodes.closed)) {
      new CustomValidator()
        .checkThrows(this.reason,
          { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_CASE_CLOSED_REASON_IS_EMPTY },
          { fn: (val) => Object.values(caseClosedReasonCodes).includes(val), m: coreErrorCodes.ERR_CASE_CLOSED_REASON_WRONG_VALUE });
    }

    if (Object.values([companyServiceCodes.HC, companyServiceCodes.DC]).includes(this.service) && CustomValidator.isEqual(this.status, caseServiceStatusCodes.pending)) {
      new CustomValidator()
        .checkThrows(this.changeSchedule,
          { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_CASE_PENDING_CHANGE_SCHEDULE_TYPE_IS_EMPTY },
          { fn: (val) => Object.values(casePendingChangeScheduleTypeCodes).includes(val), m: coreErrorCodes.ERR_CASE_PENDING_CHANGE_SCHEDULE_TYPE_WRONG_VALUE });
    }
    return this;
  }
}

module.exports = CreateCaseStatusRequest;
