/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-account-password-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-15 01:54:31 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class UpdateAccountPasswordRequest extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} oldPassword
     * @description 舊密碼
     * @member
     */
    this.oldPassword = '';
    /**
     * @type {string} newPassword
     * @description 新密碼
     * @member
     */
    this.newPassword = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.oldPassword, coreErrorCodes.ERR_OLD_PASSWORD_IS_EMPTY)
      .nonEmptyStringThrows(this.newPassword, coreErrorCodes.ERR_NEW_PASSWORD_IS_EMPTY);
    return this;
  }
}

module.exports = UpdateAccountPasswordRequest;
