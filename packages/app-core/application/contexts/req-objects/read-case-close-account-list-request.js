/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: read-case-close-account-list-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-12-04 11:59:33 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class ReadCaseCloseAccountListRequest extends BaseBundle {
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
    * @type {number} serviceCategory
    * @description 服務類型
    * @member
    */
    this.serviceCategory = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.year, coreErrorCodes.ERR_YEAR_IS_EMPTY)
      .nonEmptyStringThrows(this.month, coreErrorCodes.ERR_MONTH_IS_EMPTY)
      .nonEmptyStringThrows(this.serviceCategory, coreErrorCodes.ERR_SERVICE_CATEGORY_WRONG_VALUE);
    return this;
  }
}

module.exports = ReadCaseCloseAccountListRequest;
