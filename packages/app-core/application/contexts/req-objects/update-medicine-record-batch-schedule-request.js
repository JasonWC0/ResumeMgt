/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-medicine-record-batch-schedule-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-30 03:41:03 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, restfulMethodCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class UpdateMedicineRecordBatchScheduleRequest extends BaseBundle {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
     * @type {string} method
     * @description 方法
     */
    this.method = '';
    /**
     * @type {string} companyId
     * @description 公司Id
     */
    this.companyId = '';
    /**
     * @type {string} caseId
     * @description 個案Id
     */
    this.caseId = '';
    /**
     * @type {array} schedules
     * @description 班表列表
     */
    this.schedules = [];
    /**
     * @type {array} oldSchedules
     * @description 原班表列表
     */
    this.oldSchedules = [];
    /**
     * @type {string} personId
     * @description 操作者人員Id
     */
    this.personId = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    this.method = CustomValidator.nonEmptyString(data.method) ? data.method.toLowerCase() : '';
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .checkThrows(this.method,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_METHOD_IS_EMPTY },
        { fn: (val) => [restfulMethodCodes.Create, restfulMethodCodes.Update, restfulMethodCodes.Delete].includes(val), m: coreErrorCodes.ERR_METHOD_WRONG_VALUE })
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .nonEmptyStringThrows(this.caseId, coreErrorCodes.ERR_CASE_ID_IS_EMPTY)
      .checkThrows(this.schedules,
        { s: CustomValidator.strategies.NON_EMPTY_ARRAY, m: coreErrorCodes.ERR_SCHEDULES_IS_EMPTY })
      .nonEmptyStringThrows(this.personId, coreErrorCodes.ERR_PERSON_ID_IS_EMPTY);

    if (CustomValidator.isEqual(this.method, restfulMethodCodes.Update)) {
      new CustomValidator()
        .checkThrows(this.oldSchedules,
          { s: CustomValidator.strategies.NON_EMPTY_ARRAY, m: coreErrorCodes.ERR_OLD_SCHEDULES_IS_EMPTY });
    }
    return this;
  }
}

module.exports = UpdateMedicineRecordBatchScheduleRequest;
