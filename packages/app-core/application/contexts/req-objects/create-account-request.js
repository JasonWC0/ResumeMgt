/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-account-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-08 02:11:25 pm
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
class CreateAccountRequest extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} id
     * @description ObjectId
     * @member
     */
    this.id = '';
    /**
     * @type {string} corpId
     * @description 集團Id
     * @member
     */
    this.corpId = '';
    /**
     * @type {string} personId
     * @description 個人Id
     * @member
     */
    this.personId = '';
    /**
     * @type {number} type
     * @description 類型 0:員工 1:顧客
     * @member
     */
    this.type = '';
    /**
     * @type {string} account
     * @description account
     * @member
     */
    this.account = '';
    /**
     * @type {string} pwd
     * @description 密碼
     * @member
     */
    this.pwd = '';
    /**
     * @type {string} companyAdmin
     * @description 機構Admin帳號
     * @member
     */
    this.companyAdmin = null;
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.corpId, coreErrorCodes.ERR_CORPORATION_ID_IS_EMPTY)
      .nonEmptyStringThrows(this.personId, coreErrorCodes.ERR_PERSON_ID_IS_EMPTY)
      .checkThrows(this.type,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_ACCOUNT_TYPE_IS_EMPTY },
        { fn: (val) => Object.values(accountTypeCodes).includes(val), m: coreErrorCodes.ERR_ACCOUNT_TYPE_WRONG_VALUE })
      .nonEmptyStringThrows(this.account, coreErrorCodes.ERR_ACCOUNT_IS_EMPTY)
      .nonEmptyStringThrows(this.pwd, coreErrorCodes.ERR_PWD_IS_EMPTY);

    if (this.companyAdmin) {
      CustomValidator.isBoolean(this.companyAdmin, coreErrorCodes.ERR_ACCOUNT_COMP_ADMIN_WRONG_TYPE);
    }

    accountRegex(this.account);

    return this;
  }
}

module.exports = CreateAccountRequest;
