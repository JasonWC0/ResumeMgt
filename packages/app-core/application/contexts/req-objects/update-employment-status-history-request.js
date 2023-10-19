/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class UpdateEmploymentStatusHistoryRequest extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} date
     * @description employment change date
     * @member
     */
    this.date = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .checkThrows(this.date,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_FILL_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_FILL_DATE_WRONG_FORMAT });
    return this;
  }
}

module.exports = UpdateEmploymentStatusHistoryRequest;
