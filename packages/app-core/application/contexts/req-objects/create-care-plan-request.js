/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-care-plan-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-06-09 05:21:32 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');
const UpdateCarePlanNewestRequest = require('./update-care-plan-newest-request.js');

/**
 * @class
 * @classdesc inherit UpdateCarePlanNewestRequest
 */
class CreateCarePlanRequest extends UpdateCarePlanNewestRequest {
  /**
* @constructor
*/
  constructor() {
    super();
    /**
     * @type {string} refCarePlanId
     * @description 參照的目前照顧計畫Id
     * @member
     */
    this.refCarePlanId = '';
  }

  checkRequired() {
    super.checkRequired();
    new CustomValidator()
      .nonEmptyStringThrows(this.refCarePlanId, coreErrorCodes.ERR_REF_CARE_PLAN_ID_IS_EMPTY);
    return this;
  }
}

module.exports = CreateCarePlanRequest;
