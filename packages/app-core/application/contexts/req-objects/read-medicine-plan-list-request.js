/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: read-medicine-plan-list-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-15 03:20:33 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

const FilterDateType = {
  planStartDate: 0,
  planEndDate: 1,
};

/**
* @class
* @classdesc inherit BaseBundle
*/
class ReadMedicinePlanListRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} companyId
     * @description 公司Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} caseId
     * @description 個案Id
     * @member
     */
    this.caseId = '';
    /**
     * @type {string} f
     * @description 開始日期
     * @member
     */
    this.f = '';
    /**
     * @type {string} e
     * @description 結束日期
     * @member
     */
    this.e = '';
    /**
     * @type {number} dType
     * @description 日期條件類型
     * @member
     */
    this.dType = null;
    /**
     * @type {string} order
     * @description 排序
     * @member
     */
    this.order = 'planStartDate';
  }

  bind(data) {
    super.bind(data, this);
    this.dType = Number(data.dType);
    return this;
  }

  checkFilterDate() {
    this.filterDate = Object.keys(FilterDateType).find((key) => FilterDateType[key] === this.dType);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .nonEmptyStringThrows(this.caseId, coreErrorCodes.ERR_CASE_ID_IS_EMPTY)
      .checkThrows(this.dType,
        { fn: (val) => Object.values(FilterDateType).includes(val), m: coreErrorCodes.ERR_FILTER_DATE_TYPE_NOT_EXIST })
      .checkThrows(this.f,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_START_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT })
      .checkThrows(this.e,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_END_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT });

    return this;
  }
}

module.exports = ReadMedicinePlanListRequest;
