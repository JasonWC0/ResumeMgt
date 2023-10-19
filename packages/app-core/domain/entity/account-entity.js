/**
 * FeaturePath: Common-Entity--帳號
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: account-entity.js
 * Project: @erpv3/app-person
 * File Created: 2022-02-08 03:35:43 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomUtils } = require('@erpv3/app-common/custom-tools');
const BaseEntity = require('./base-entity');

/**
* @class
* @classdesc AccountEntity login account
*/
class AccountEntity extends BaseEntity {
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
     * @description 總公司Id
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
     * @description 類型 0:employee; 1:customer
     * @member {number}
     */
    this.type = null;
    /**
     * @type {string} account
     * @description 帳號
     * @member {string}
     */
    this.account = '';
    /**
     * @type {string} pwd
     * @description 密碼
     * @member {string}
     */
    this.pwd = '';
    /**
     * @type {string} keycloakId
     * @description keycloakId
     * @member {string}
     */
    this.keycloakId = '';
    /**
     * @type {bool} companyAdmin
     * @description 帳號是否為機構admin
     * @member {bool}
     */
    this.companyAdmin = false;
  }

  bind(data) {
    super.bind(data, this);
    this.account = this.account.toLowerCase();
    return this;
  }

  bindDBObjectId(data) {
    super.bind(data, this);
    this.corpId = data.corpId.toString();

    if (data.personId) {
      // data is populate
      if (data.personId._id) {
        const _person = CustomUtils.deepCopy(data.personId);
        this.personId = _person._id;
        this.personObject = _person;
      } else {
        this.personId = data.personId;
      }
    }

    this.personId = this.personId ? this.personId.toString() : '';
    return this;
  }

  toView() {
    return {
      id: this.id,
      account: this.account,
      corpId: this.corpId,
      personId: this.personId,
      vn: this.__vn,
    };
  }
}

module.exports = AccountEntity;
