/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: reset-account-password-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-05-31 03:15:05 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class ResetAccountPasswordRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
    * @type {string} account
    * @description 帳號
    * @member
    */
    this.account = '';
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
      .nonEmptyStringThrows(this.account, coreErrorCodes.ERR_ACCOUNT_IS_EMPTY)
      .nonEmptyStringThrows(this.newPassword, coreErrorCodes.ERR_NEW_PASSWORD_IS_EMPTY);
    return this;
  }
}

module.exports = ResetAccountPasswordRequest;
