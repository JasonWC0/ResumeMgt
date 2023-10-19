/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-commonly-used-name-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-08 04:17:24 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class UpdateCommonlyUsedNameRequest extends BaseBundle {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
    * @type {companyId}
    */
    this.companyId = '';
    /**
    * @type {name}
    */
    this.name = [];
  }

  bind(data = {}) {
    super.bind(data, this);
    this.name = CustomValidator.nonEmptyArray(this.name) ? this.name : (CustomValidator.nonEmptyString(data.name) ? data.name.split(',').map((n) => n.trim()) : []);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .checkThrows(this.name,
        { s: CustomValidator.strategies.NON_EMPTY_ARRAY, m: coreErrorCodes.ERR_COMMONLY_USED_NAME_IS_EMPTY });
    return this;
  }

  checkReplaceRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY);
    return this;
  }
}

module.exports = UpdateCommonlyUsedNameRequest;
