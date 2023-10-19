/**
 * FeaturePath: Common-Entity--員工聯絡物件
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
 * @classdesc Represents contact object
 */
class EmployeeContactObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} name
     * @description 姓名
     * @member
     */
    this.name = null;
    /**
     * @type {string} mobile
     * @description 手機
     * @member
     */
    this.mobile = null;
    /**
     * @type {string} phoneH
     * @description 家裡電話
     * @member
     */
    this.phoneH = null;
    /**
     * @type {string} relationship
     * @description 關係
     * @member
     */
    this.relationship = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
  * @method
  * @description Return formated info
  * @returns {Object}
  */
  toView() {
    return {
      name: this.name,
      mobile: this.mobile,
      phoneH: this.phoneH,
      relationship: this.relationship,
    };
  }
}

module.exports = EmployeeContactObject;
