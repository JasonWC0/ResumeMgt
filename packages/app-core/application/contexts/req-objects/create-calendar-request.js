/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-calendar-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-19 05:41:13 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');
const UpdateCalendarRequest = require('./update-calendar-request');

/**
* @class
* @classdesc inherit BaseBundle
*/
class CreateCalendarRequest extends UpdateCalendarRequest {
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
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired(category) {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY);
    super.checkRequired(category);
    return this;
  }
}

module.exports = CreateCalendarRequest;
