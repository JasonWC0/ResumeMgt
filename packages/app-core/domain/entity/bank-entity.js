/**
 * FeaturePath: Common-Entity--銀行資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: bank-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-27 01:45:54 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const BaseEntity = require('./base-entity');

/**
* @class
* @classdesc BankEntity
*/
class BankEntity extends BaseEntity {
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
     * @type {string} code
     * @description 銀行代碼
     * @member
     */
    this.code = '';
    /**
     * @type {string} name
     * @description 銀行名稱
     * @member
     */
    this.name = '';
  }
}

module.exports = BankEntity;
