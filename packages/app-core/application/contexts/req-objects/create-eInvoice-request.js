/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-eInvoice-request.js
 * Project: @erpv3/app-core
 * File Created: 2023-03-08 05:13:00 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');
const UpdateEInvoiceRequest = require('./update-eInvoice-request');

/**
* @class
* @classdesc inherit BaseBundle
*/
class CreateEInvoiceRequest extends UpdateEInvoiceRequest {
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
    /**
     * @type {string} serialString
     * @description 結帳編號
     * @member
     */
    this.serialString = '';
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .nonEmptyStringThrows(this.caseId, coreErrorCodes.ERR_CASE_ID_IS_EMPTY)
      .nonEmptyStringThrows(this.serialString, coreErrorCodes.ERR_EINVOICE_SERIAL_STRING_IS_EMPTY);
    return this;
  }
}

module.exports = CreateEInvoiceRequest;
