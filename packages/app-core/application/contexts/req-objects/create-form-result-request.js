/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-form-result-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-17 05:12:03 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');
const UpdateFormResultRequest = require('./update-form-result-request');

/**
 * @class
 * @classdesc inherit UpdateFormResultRequest
 */
class CreateFormResultRequest extends UpdateFormResultRequest {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} formId
     * @description 表單Id
     * @member
     */
    this.formId = '';
    /**
     * @type {string} caseId
     * @description 個案Id
     * @member
     */
    this.caseId = '';
    /**
     * @type {string} caseName
     * @description 個案姓名
     * @member
     */
    this.caseName = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    super.checkRequired();
    new CustomValidator()
      .nonEmptyStringThrows(this.formId, coreErrorCodes.ERR_FORM_ID_IS_EMPTY)
      .nonEmptyStringThrows(this.caseId, coreErrorCodes.ERR_CASE_ID_IS_EMPTY)
      .nonEmptyStringThrows(this.caseName, coreErrorCodes.ERR_CASE_NAME_IS_EMPTY);
    return this;
  }
}

module.exports = CreateFormResultRequest;
