/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const UpdateEmployeeRequest = require('./update-employee-request');
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class UpdateEmployeeForSyncRequest extends UpdateEmployeeRequest {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} updCompanyId
     * @description String
     * @member
     */
    this.updCompanyId = null;
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    super.checkRequired();
    if (this.updCompanyId !== null) {
      CustomValidator.nonEmptyString(this.updCompanyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY);
    }
    return this;
  }
}

module.exports = UpdateEmployeeForSyncRequest;
