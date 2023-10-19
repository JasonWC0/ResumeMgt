/**
 * FeaturePath: Common-Entity--銀行帳戶物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: bank-account-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-02-10 01:41:08 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class BankAccountObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} name
     * @description 銀行名稱
     * @member {string}
     */
    this.name = '';
    /**
     * @type {string} branch
     * @description 分行名稱
     * @member {string}
     */
    this.branch = '';
    /**
     * @type {string} account
     * @description 帳戶名稱
     * @member {string}
     */
    this.account = '';
    /**
     * @type {string} number
     * @description 帳戶號碼
     * @member {string}
     */
    this.number = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = BankAccountObject;
