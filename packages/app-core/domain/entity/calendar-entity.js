/**
 * FeaturePath: Common-Entity--假日行事曆
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: calendar-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-19 11:50:00 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const BaseEntity = require('./base-entity');

/**
 * @class
 * @classdesc CalendarEntity
 */
class CalendarEntity extends BaseEntity {
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
     * @type {string} companyId
     * @description 機構(公司)Id
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
     * @type {number} type
     * @description 分類
     * @member
     */
    this.type = null;
    /**
     * @type {string} date
     * @description 日期
     * @member
     */
    this.date = '';
    /**
     * @type {string} time
     * @description 時間
     * @member
     */
    this.time = '';
    /**
     * @type {string} note
     * @description 備註/內容
     * @member
     */
    this.note = '';
  }

  withType(type = null) {
    this.type = type;
    return this;
  }

  withDate(date = '') {
    this.date = date;
    return this;
  }

  bindDBObjectId(data) {
    super.bind(data, this);
    if (data.companyId) {
      this.companyId = data.companyId.toString();
    }
    return this;
  }
}

module.exports = CalendarEntity;
