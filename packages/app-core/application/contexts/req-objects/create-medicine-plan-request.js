/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-medicine-plan-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-16 06:13:00 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');
const UpdateMedicinePlanRequest = require('./update-medicine-plan-request');

/**
* @class
* @classdesc inherit BaseBundle
*/
class CreateMedicinePlanRequest extends UpdateMedicinePlanRequest {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} companyId
     * @description 公司Id
     */
    this.companyId = '';
    /**
     * @type {string} caseId
     * @description 個案Id
     */
    this.caseId = '';
  }

  checkRequired() {
    super.checkRequired();
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .nonEmptyStringThrows(this.caseId, coreErrorCodes.ERR_CASE_ID_IS_EMPTY);
    return this;
  }
}

module.exports = CreateMedicinePlanRequest;
