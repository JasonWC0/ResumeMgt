/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-nursing-shift-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-13 03:41:16 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');
const UpdateNursingShiftRequest = require('./update-nursing-shift-request');

/**
 * @class
 * @classdesc inherit UpdateNursingShiftRequest
 */
class CreateNursingShiftRequest extends UpdateNursingShiftRequest {
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
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    super.checkRequired();
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY);

    return this;
  }
}

module.exports = CreateNursingShiftRequest;
