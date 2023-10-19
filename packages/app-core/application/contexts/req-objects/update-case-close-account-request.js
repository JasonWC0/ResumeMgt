/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-case-close-account-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-12-04 11:59:33 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, caseCloseAccountStatusCodes } = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class UpdateCaseCloseAccountRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} year
     * @description 年份
     * @member
     */
    this.year = '';
    /**
     * @type {string} month
     * @description 月份
     * @member
     */
    this.month = '';
    /**
     * @type {object[]} cases
     * @description 個案資訊
     * @member
     */
    this.cases = null;
    /**
    * @type {number} status
    * @description 關帳狀態
    * @member
    */
    this.status = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .checkThrows(this.year,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_YEAR_IS_EMPTY },
        { fn: (val) => CustomRegex.yearFormat(val), m: coreErrorCodes.ERR_YEAR_WRONG_FORMAT })
      .checkThrows(this.month,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_MONTH_IS_EMPTY },
        { fn: (val) => CustomRegex.monthFormat(val), m: coreErrorCodes.ERR_MONTH_WRONG_FORMAT })
      .checkThrows(this.status,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_CASE_CLOSE_ACCOUNT_STATUS_IS_EMPTY },
        { fn: (val) => Object.values(caseCloseAccountStatusCodes).includes(val), m: coreErrorCodes.ERR_CASE_CLOSE_ACCOUNT_STATUS_WRONG_VALUE })
      .checkThrows(this.cases,
        { s: CustomValidator.strategies.NON_EMPTY_ARRAY, m: coreErrorCodes.ERR_CASES_IS_EMPTY });

    return this;
  }
}

module.exports = UpdateCaseCloseAccountRequest;
