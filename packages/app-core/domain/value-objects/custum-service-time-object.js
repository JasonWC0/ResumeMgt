/**
 * FeaturePath: Common-Entity--自訂服務項目時間物件
 * Accountable: Tang Chuang, JoyceS Hsu
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
 * @classdesc Represents custum service time object
 */
class CustumServiceTimeObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {number} personalTime
     * @description 自訂服務項目時間
     * @member
     */
    this.personalTime = null;
    /**
     * @type {number} fixedTime
     * @description 自訂服務項目時間
     * @member
     */
    this.fixedTime = null;
    /**
     * @type {string} note
     * @description 自訂服務項目備註
     * @member
     */
    this.note = '';
  }

  /**
   * @method
   * @description bind CustumServiceTimeObject
   * @param {objet} data
   * @returns {CustumServiceTimeObject} this
   */
  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
   * @method
   * @description Set personalTime
   * @param {number} personalTime
   * @returns {CustumServiceTimeObject} this
   */
  withPersonalTime(personalTime = null) {
    this.personalTime = personalTime;
    return this;
  }

  /**
   * @method
   * @description Set fixedTime
   * @param {number} fixedTime
   * @returns {CustumServiceTimeObject} this
   */
  withFixedTime(fixedTime = null) {
    this.fixedTime = fixedTime;
    return this;
  }

  /**
   * @method
   * @description Set note
   * @param {string} note
   * @returns {CustumServiceTimeObject} this
   */
  withNote(note = '') {
    this.note = note;
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkCustomServiceRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.personalTime, customerErrorCodes.ERR_PERSONAL_TIME_IS_EMPTY)
      .nonEmptyStringThrows(this.fixedTime, customerErrorCodes.ERR_FIXED_TIME_IS_EMPTY)
      .nonEmptyStringThrows(this.note, customerErrorCodes.ERR_NOTE_IS_EMPTY)
    return this;
  }

  /**
  * @method
  * @description Return formated info
  * @returns {Object}
  */
  responseInfo() {
    return {
      personalTime: this.personalTime,
      fixedTime: this.fixedTime,
      note: this.note,
    };
  }
}

module.exports = CustumServiceTimeObject;
