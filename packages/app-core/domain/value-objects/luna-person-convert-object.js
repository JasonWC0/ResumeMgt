/**
 * FeaturePath: Common-Entity--轉換v25人物物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
/**
 * @class
 * @classdesc Represents place object
 */
class LunaPersonConvertObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} personId
     * @description 人員ID
     * @member
     */
    this.personId = '';
    /**
     * @type {string} personType
     * @description 人員轉換類別
     * @member
     */
    this.personType = '';
    /**
     * @type {string} replaceTo
     * @description 替換API位置
     * @member
     */
    this.replaceTo = '';
    /**
     * @type {string} replacePath
     * @description 替換路徑
     * @member
     */
    this.replacePath = '';
  }

  /**
   * @method
   * @description bind LunaPersonConvertObject
   * @param {objet} data
   * @returns {LunaPersonConvertObject} this
   */
  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
   * @method
   * @description Set personId
   * @param {string} personId
   * @returns {LunaPersonConvertObject} this
   */
  withPersonId(personId = '') {
    this.personId = personId;
    return this;
  }

  /**
   * @method
   * @description Set personType
   * @param {string} personType
   * @returns {LunaPersonConvertObject} this
   */
  withPersonType(personType = '') {
    this.personType = personType;
    return this;
  }

  /**
   * @method
   * @description Set replaceTo
   * @param {string} replaceTo
   * @returns {LunaPersonConvertObject} this
   */
  withReplaceTo(replaceTo = '') {
    this.replaceTo = replaceTo;
    return this;
  }

  /**
   * @method
   * @description Set replacePath
   * @param {string} replacePath
   * @returns {LunaPersonConvertObject} this
   */
  withReplacePath(replacePath = '') {
    this.replacePath = replacePath;
    return this;
  }
}

module.exports = LunaPersonConvertObject;
