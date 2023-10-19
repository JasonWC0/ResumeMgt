/**
 * FeaturePath: Common-Entity--個案家系圖物件
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
class CaseChartGenogramObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {Number} other
     * @description 圖形序號
     * @member
     */
    this.id = 0;
    /**
     * @type {String} gender
     * @description 個案性別
     * @member
     */
    this.gender = '';
    /**
     * @type {String} status
     * @description 個案健康狀態
     * @member
     */
    this.status = '';
    /**
     * @type {String} age
     * @description 個案年齡
     * @member
     */
    this.age = '';
    /**
     * @type {String} marriage
     * @description 婚姻狀況
     * @member
     */
    this.marriage = '';
    /**
     * @type {Array} marriages
     * @description 婚姻
     * @member
     */
    this.marriages = [];
    /**
     * @type {String} time
     * @description 註明日期
     * @member
     */
    this.time = '';
    /**
     * @type {String} partnerStatus
     * @description 伴侶健康狀態
     * @member
     */
    this.partnerStatus = '';
    /**
     * @type {String} partnerAge
     * @description 伴侶年齡
     * @member
     */
    this.partnerAge = '';
    /**
     * @type {Boolean} partnerAge
     * @description 是否為個案
     * @member
     */
    this.isCase = true;
    /**
     * @type {Number} parent
     * @description 上一代成員
     * @member
     */
    this.parent = null;
    /**
     * @type {Number} parentNumber
     * @description 上一代第幾段婚姻
     * @member
     */
    this.parentNumber = null;
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
      id: this.id,
      gender: this.gender,
      status: this.status,
      age: this.age,
      marriage: this.marriage,
      marriages: this.marriages,
      time: this.time,
      partnerStatus: this.partnerStatus,
      partnerAge: this.partnerAge,
      isCase: this.isCase,
      parent: this.parent,
      parentNumber: this.parentNumber,
    };
  }
}

module.exports = CaseChartGenogramObject;
