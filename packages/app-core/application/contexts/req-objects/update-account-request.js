/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-account-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-05-12 02:19:46 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, accountTypeCodes } = require('../../../domain');
const { accountRegex } = require('../req-regex/account-regex-tool');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class UpdateAccountRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} corpId
     * @description 企業Id
     * @member
     */
    this.corpId = '';
    /**
     * @type {string} newAccount
     * @description 新帳號
     * @member
     */
    this.newAccount = '';
    /**
     * @type {number} type
     * @description 帳號類型 0:員工 1:顧客
     * @member
     */
    this.type = null;
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    if (this.type) {
      new CustomValidator()
        .checkThrows(this.type,
          { fn: (val) => Object.values(accountTypeCodes).includes(val), m: coreErrorCodes.ERR_ACCOUNT_TYPE_WRONG_VALUE });
    }

    if (CustomValidator.nonEmptyString(this.newAccount)) {
      accountRegex(this.newAccount);
    }

    return this;
  }
}

module.exports = UpdateAccountRequest;
