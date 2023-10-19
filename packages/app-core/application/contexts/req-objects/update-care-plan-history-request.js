/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-care-plan-history-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-06-07 02:58:28 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { coreErrorCodes } = require('../../../domain');

class UpdateCarePlanHistoryRequest extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} planStartDate
     * @description 生效日
     * @member
     */
    this.planStartDate = '';
    /**
     * @type {string} note
     * @description 備註(注意事項)
     * @member
     */
    this.note = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .checkThrows(this.planStartDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_PLAN_START_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_PLAN_START_DATE_WRONG_FORMAT });

    return this;
  }
}

module.exports = UpdateCarePlanHistoryRequest;
