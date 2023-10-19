/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-medicine-record-batch-status-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-31 11:32:17 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, medicineRecordCaseStatusCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class UpdateMedicineRecordBatchStatusRequest extends BaseBundle {
  /**
* @constructor
*/
  constructor() {
    super();
    /**
     * @type {string} caseId
     * @description 個案Id
     */
    this.caseId = '';
    /**
     * @type {number} caseStatus
     * @description 個案狀態
     */
    this.caseStatus = null;
    /**
     * @type {number} scheduleStatus
     * @description 排班狀態
     */
    this.scheduleStatus = null;
    /**
     * @type {string} date
     * @description 日期
     */
    this.date = '';
    /**
     * @type {string} startDate
     * @description 開始日期
     */
    this.startDate = '';
    /**
     * @type {string} endDate
     * @description 結束日期
     */
    this.endDate = '';
    /**
     * @type {string} personId
     * @description 操作者人員Id
     */
    this.personId = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired(type) {
    new CustomValidator()
      .nonEmptyStringThrows(this.caseId, coreErrorCodes.ERR_CASE_ID_IS_EMPTY)
      .nonEmptyStringThrows(this.personId, coreErrorCodes.ERR_PERSON_ID_IS_EMPTY);

    if (type === 'case') {
      new CustomValidator()
        .checkThrows(this.caseStatus,
          { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_MED_CASE_STATUS_IS_EMPTY },
          { fn: (val) => Object.values(medicineRecordCaseStatusCodes).includes(val), m: coreErrorCodes.ERR_MED_CASE_STATUS_NOT_EXIST })
        .checkThrows(this.startDate,
          { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_START_DATE_IS_EMPTY },
          { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT });

      if (CustomValidator.nonEmptyString(this.endDate)) {
        new CustomValidator()
          .checkThrows(this.endDate,
            { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT });
      }
    } else if (type === 'schedule') {
      new CustomValidator()
        .checkThrows(this.scheduleStatus,
          { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_SCHEDULE_STATUS_IS_EMPTY },
          { fn: (val) => [medicineRecordCaseStatusCodes.Leave, medicineRecordCaseStatusCodes.CancelLeave].includes(val), m: coreErrorCodes.ERR_SCHEDULE_STATUS_NOT_EXIST })
        .checkThrows(this.date,
          { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_DATE_IS_EMPTY },
          { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_DATE_WRONG_FORMAT });
    }
    return this;
  }
}

module.exports = UpdateMedicineRecordBatchStatusRequest;
