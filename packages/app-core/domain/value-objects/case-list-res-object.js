/**
 * FeaturePath: Common-Entity--檢視個案列表物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const caseServiceStatusCodes = require('../enums/case-service-status-codes');

/**
 * @class
 * @classdesc Represents rc of case object
 */
class CaseListResObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {String} caseNumber
     * @description 個案編號
     * @member
     */
    this.caseNumber = '';
    /**
     * @type {Number} height
     * @description 身高
     * @member
     */
    /**
     * @type {String} category
     * @description 個案分類
     * @member
     */
    this.category = '';
    /**
     * @type {Number} reliefType
     * @description 福利身分別
     * @member
     */
    this.reliefType = '';
    /**
     * @type {Date} startDate
     * @description 服務開始日期
     * @member
     */
    this.startDate = '';
    /**
     * @type {Date} endDate
     * @description 服務結束日期
     * @member
     */
    this.endDate = '';
    /**
     * @type {Number} status
     * @description 個案狀態
     * @member
     */
    this.status = '';
    /**
     * @type {Number} nowStatus
     * @description 個案日期前最後狀態
     * @member
     */
    this.nowStatus = '';
  }

  /**
   * @method
   * @description bind CaseListResObject
   * @param {objet} data
   * @returns {CaseListResObject} this
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
      caseNumber: this.caseNumber,
      category: this.category,
      reliefType: this.reliefType,
      startDate: this.startDate,
      endDate: this.endDate,
      status: (this?.nowStatus && Object.values(caseServiceStatusCodes).includes(this.nowStatus)) ? this.nowStatus : this.status,
    };
  }
}

module.exports = CaseListResObject;
