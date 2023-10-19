/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-case-status-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-05 01:41:41 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const {
  coreErrorCodes,
  companyServiceCodes,
  caseClosedReasonCodes,
} = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class UpdateCaseStatusRequest extends BaseBundle {
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
    * @type {string} date
    * @description 日期
    * @member
    */
    this.date = '';
    /**
    * @type {number} reason
    * @description 原因
    * @member
    */
    this.reason = null;
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
    this.service = this.service.toLowerCase();
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.caseId, coreErrorCodes.ERR_CASE_ID_IS_EMPTY)
      .checkThrows(this.service,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_SERVICE_CATEGORY_IS_EMPTY },
        { fn: (val) => Object.values(companyServiceCodes).includes(val), m: coreErrorCodes.ERR_SERVICE_WRONG_VALUE })
      .checkThrows(this.date,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_DATE_WRONG_FORMAT });
    return this;
  }

  checkClosedRequired() {
    new CustomValidator()
      .checkThrows(this.reason,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_CASE_CLOSED_REASON_IS_EMPTY },
        { fn: (val) => Object.values(caseClosedReasonCodes).includes(val), m: coreErrorCodes.ERR_CASE_CLOSED_REASON_WRONG_VALUE });
    return this;
  }
}

module.exports = UpdateCaseStatusRequest;
