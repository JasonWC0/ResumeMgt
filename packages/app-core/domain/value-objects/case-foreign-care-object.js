/**
 * FeaturePath: Common-Entity--外籍看護物件
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
 * @classdesc Represents dc of case object
 */
class CaseForeignCareObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {Number} hireForeignCare
     * @description 是否聘雇
     * @member
     */
    this.hireForeignCare = false;
    /**
     * @type {Number} gender
     * @description 性別
     * @member
     */
    this.gender = null;
    /**
     * @type {String} passportNumber
     * @description 護照號碼
     * @member
     */
    this.passportNumber = null;
    /**
     * @type {Number} nationality
     * @description 國籍
     * @member
     */
    this.nationality = null;
    /**
     * @type {String} city
     * @description 工作縣市
     * @member
     */
    this.city = null;
    /**
     * @type {String} recruitmentNumber
     * @description 核准招募文號
     * @member
     */
    this.recruitmentNumber = null;
    /**
     * @type {String} employmentNumber
     * @description 最新聘雇函文號
     * @member
     */
    this.employmentNumber = null;
    /**
     * @type {Date} recruitmentDate
     * @description 聘雇函核准日期
     * @member
     */
    this.recruitmentDate = null;
    /**
     * @type {Date} startDate
     * @description 工作起始日
     * @member
     */
    this.startDate = null;
    /**
     * @type {Date} endDate
     * @description 契約期滿日期
     * @member
     */
    this.endDate = null;
    /**
     * @type {Date} createDate
     * @description 建立日期
     * @member
     */
    this.createDate = null;
  }

  /**
   * @method
   * @description bind CaseDcObject
   * @param {objet} data
   * @returns {CaseDcObject} this
   */
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
      hireForeignCare: this.hireForeignCare,
      gender: this.gender,
      passportNumber: this.passportNumber,
      nationality: this.nationality,
      city: this.city,
      recruitmentNumber: this.recruitmentNumber,
      employmentNumber: this.employmentNumber,
      recruitmentDate: this.recruitmentDate,
      startDate: this.startDate,
      endDate: this.endDate,
      createDate: this.createDate,
    };
  }
}

module.exports = CaseForeignCareObject;
