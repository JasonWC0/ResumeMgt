/**
 * FeaturePath: Common-Entity--護理班別
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: nursing-shift-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-13 01:52:34 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const BaseEntity = require('./base-entity');

/**
 * @class
 * @classdesc NursingShiftEntity
 */
class NursingShiftEntity extends BaseEntity {
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
     * @type {string} code
     * @description 護理班別代碼簡稱
     * @member
     */
    this.code = '';
    /**
     * @type {string} name
     * @description 護理班別名稱
     * @member
     */
    this.name = '';
    /**
     * @type {string} startedAt
     * @description 起始時間HH:mm
     * @member
     */
    this.startedAt = '';
    /**
     * @type {string} endedAt
     * @description 結束時間HH:mm
     * @member
     */
    this.endedAt = '';
    /**
     * @type {string} detail
     * @description 護理班別敘述
     * @member
     */
    this.detail = '';
    /**
     * @type {boolean} isDayOff
     * @description 是否休息班
     * @member
     */
    this.isDayOff = null;
  }

  bindDBObjectId(data) {
    super.bind(data, this);
    if (data.companyId) { this.companyId = data.companyId.toString(); }
    return this;
  }

  toView() {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      detail: this.detail,
      isDayOff: this.isDayOff,
      vn: this.__vn,
    };
  }
}

module.exports = NursingShiftEntity;
