/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-nursing-shift-schedule-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-25 10:26:09 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');
const UpdateNursingShiftScheduleRequest = require('./update-nursing-shift-schedule-request');

/**
 * @class
 * @classdesc inherit UpdateNursingShiftScheduleRequest
 */
class CreateNursingShiftScheduleRequest extends UpdateNursingShiftScheduleRequest {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} companyId
     * @description 機構Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} date
     * @description 日期
     * @member
     */
    this.date = '';
    /**
     * @type {string} personId
     * @description 人員Id
     * @member
     */
    this.personId = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    super.checkRequired();
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .nonEmptyStringThrows(this.personId, coreErrorCodes.ERR_PERSON_ID_IS_EMPTY)
      .checkThrows(this.date,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_DATE_WRONG_FORMAT });

    return this;
  }
}

module.exports = CreateNursingShiftScheduleRequest;
