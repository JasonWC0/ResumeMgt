/**
 * FeaturePath: Common-Entity--居住式服務紀錄物件
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
 * @classdesc Represents rc of case object
 */
class CaseRcHistoryRecordObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
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
     * @type {Date} scheduledStartDate
     * @description 預計服務開始時間
     * @member
     */
    this.scheduledStartDate = new Date();
    /**
     * @type {Date} scheduledEndDate
     * @description 預計服務結束時間
     * @member
     */
    this.scheduledEndDate = new Date();
    /**
     * @type {String} roomType
     * @description 房型
     * @member
     */
    this.roomType = '';
    /**
     * @type {String} roomNo
     * @description 房號
     * @member
     */
    this.roomNo = '';
    /**
     * @type {String} bedNo
     * @description 床號
     * @member
     */
    this.bedNo = '';
  }

  /**
   * @method
   * @description bind CaseRcHistoryRecordObject
   * @param {objet} data
   * @returns {CaseRcHistoryRecordObject} this
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
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status,
      scheduledStartDate: this.scheduledStartDate,
      scheduledEndDate: this.scheduledEndDate,
      roomType: this.roomType,
      roomNo: this.roomNo,
      bedNo: this.bedNo,
    };
  }
}

module.exports = CaseRcHistoryRecordObject;
