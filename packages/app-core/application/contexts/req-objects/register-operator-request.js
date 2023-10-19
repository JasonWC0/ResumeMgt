/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: register-operator-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-17 04:04:36 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { BaseBundle } = require('@erpv3/app-common/custom-models');

/**
* @class
* @classdesc inherit BaseBundle
*/
class RegisterOperatorRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
    * @type {string} personId
    * @description 個人Id
    * @member
    */
    this.personId = '';
    /**
    * @type {string} name
    * @description 員工姓名
    * @member
    */
    this.name = '';
    /**
    * @type {string} companyId
    * @description 公司Id
    * @member
    */
    this.companyId = '';
    /**
    * @type {string} region
    * @description 地區
    * @member
    */
    this.region = '';
    /**
    * @type {string} account
    * @description 帳號
    * @member
    */
    this.account = '';
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
      .nonEmptyStringThrows(this.personId)
      .nonEmptyStringThrows(this.name)
      .nonEmptyStringThrows(this.companyId)
      .nonEmptyStringThrows(this.region);
    return this;
  }
}
module.exports = RegisterOperatorRequest;
