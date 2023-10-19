/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-nursing-shift-schedule-copy-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-25 04:39:49 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class CreateNursingShiftScheduleCopyRequest extends BaseBundle {
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
     * @type {string} personId
     * @description 人員Id
     * @member
     */
    this.personId = '';
    /**
     * @type {string} fromStartDate
     * @description 複製開始日期
     * @member
     */
    this.fromStartDate = '';
    /**
     * @type {string} fromEndDate
     * @description 複製結束日期
     * @member
     */
    this.fromEndDate = '';
    /**
     * @type {string} toStartDate
     * @description 貼上開始日期
     * @member
     */
    this.toStartDate = '';
    /**
     * @type {string} toEndDate
     * @description 貼上結束日期
     * @member
     */
    this.toEndDate = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .checkThrows(this.fromStartDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_FROM_START_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_FROM_START_DATE_WRONG_FORMAT })
      .checkThrows(this.fromEndDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_FROM_END_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_FROM_END_DATE_WRONG_FORMAT })
      .checkThrows(this.toStartDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_TO_START_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_TO_START_DATE_WRONG_FORMAT })
      .checkThrows(this.toEndDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_TO_END_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_TO_END_DATE_WRONG_FORMAT });
    return this;
  }

  toDate() {
    const DATE_FORMAT = 'YYYY/MM/DD';
    this.fromStartDate = moment(this.fromStartDate, DATE_FORMAT).toDate();
    this.fromEndDate = moment(this.fromEndDate, DATE_FORMAT).toDate();
    this.toStartDate = moment(this.toStartDate, DATE_FORMAT).toDate();
    this.toEndDate = moment(this.toEndDate, DATE_FORMAT).toDate();
    return this;
  }
}

module.exports = CreateNursingShiftScheduleCopyRequest;
