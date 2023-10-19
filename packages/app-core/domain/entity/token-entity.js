/**
 * FeaturePath: Common-Entity--Token
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: token-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-24 02:52:15 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const BaseEntity = require('./base-entity');

class TokenEntity extends BaseEntity {
  constructor() {
    super();
    /**
     * @type {string} token
     * @description token
     * @member
     */
    this.token = '';
    /**
     * @type {string} accountId
     * @description accountId
     * @member
     */
    this.accountId = '';
    /**
     * @type {string} account
     * @description account
     * @member
     */
    this.account = '';
    /**
     * @type {string} corpId
     * @description corpId
     * @member
     */
    this.corpId = '';
    /**
     * @type {object} companies
     * @description 多公司資料{id: { 全名, 頁面頁籤權限 } } "companies._id": { fullName, pageAuth }
     * @member
     */
    this.companies = {};
    /**
     * @type {string} personId
     * @description 登入者personId
     * @member
     */
    this.personId = '';
    /**
     * @type {string} name
     * @description 登入者姓名
     * @member
     */
    this.name = '';
    /**
     * @type {string} keycloakId
     * @description keycloakId
     * @member
     */
    this.keycloakId = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  bindDB(data) {
    super.bind(data, this);
    this.accountId = this.accountId.toString();
    this.corpId = this.corpId.toString();
    this.personId = this.personId.toString();
    return this;
  }

  toView() {
    return {
      accountId: this.accountId,
      account: this.account,
      corpId: this.corpId,
      personId: this.personId,
      name: this.name,
      companies: this.companies,
    };
  }
}

module.exports = TokenEntity;
