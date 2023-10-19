/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-case-html-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-06-22 05:03:49 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const UpdateCaseHtmlRequest = require('./update-case-html-request');
const { coreErrorCodes, companyServiceCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class CreateCaseHtmlRequest extends UpdateCaseHtmlRequest {
  /**
* @constructor
*/
  constructor() {
    super();
    /**
     * @type {string} caseService
     * @description 個案服務類型
     * @member
     */
    this.caseService = '';
  }

  bind(data) {
    super.bind(data);
    this.caseService = data.caseService.toUpperCase();
    return this;
  }

  checkRequired() {
    super.checkRequired();
    new CustomValidator()
      .checkThrows(this.caseService,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_CASE_SERVICE_IS_EMPTY },
        { fn: (val) => Object.values(companyServiceCodes).includes(val), m: coreErrorCodes.ERR_CASE_SERVICE_NOT_EXISTS });
    return this;
  }
}

module.exports = CreateCaseHtmlRequest;
