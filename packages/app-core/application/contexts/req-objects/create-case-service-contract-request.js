/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-case-service-contract-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-12-05 05:19:25 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');
const UpdateCaseServiceContractRequest = require('./update-case-service-contract-request');

class CreateCaseServiceContractRequest extends UpdateCaseServiceContractRequest {
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
     * @type {string} caseId
     * @description 個案Id
     * @member
     */
    this.caseId = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    super.checkRequired();
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .nonEmptyStringThrows(this.caseId, coreErrorCodes.ERR_CASE_ID_IS_EMPTY);
    return this;
  }
}

module.exports = CreateCaseServiceContractRequest;
