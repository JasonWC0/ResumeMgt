/**
 * FeaturePath: Common-Entity--聯絡人物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const customerErrorCodes = require('../enums/error-codes');

/**
 * @class
 * @classdesc Represents contact object
 */
class ContactObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} personId
     * @description 個人ID
     * @member
     */
    this.personId = null;
    /**
     * @type {string} age
     * @description 年齡
     * @member
     */
    this.age = null;
    /**
     * @type {string} relationship
     * @description 關係
     * @member
     */
    this.relationship = '';
    /**
     * @type {string} note
     * @description 註明
     * @member
     */
    this.note = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.personId, customerErrorCodes.ERR_PERSON_ID_IS_EMPTY);
  }

  /**
  * @method
  * @description Return formated info
  * @returns {Object}
  */
  responseInfo() {
    return {
      personId: this.personId,
      relationship: this.relationship,
      age: this.age,
      note: this.note,
    };
  }
}

module.exports = ContactObject;
