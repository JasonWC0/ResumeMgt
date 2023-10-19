/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: login-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-23 04:10:17 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

class LoginRequest extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} account
     * @description 帳號
     * @member
     */
    this.account = '';
    /**
     * @type {string} pwd
     * @description 密碼
     * @member
     */
    this.pwd = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白
   */
  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.account, coreErrorCodes.ERR_ACCOUNT_IS_EMPTY)
      .nonEmptyStringThrows(this.pwd, coreErrorCodes.ERR_PWD_IS_EMPTY);
    return this;
  }
}

module.exports = LoginRequest;
