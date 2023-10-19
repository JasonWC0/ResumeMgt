/**
 * FeaturePath: Common-Entity--護理班別物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: nursing-shift-object.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-24 11:41:08 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class NursingShiftObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} nursingShiftId
     * @description 護理班別Id
     * @member {string}
     */
    this.nursingShiftId = '';
    /**
     * @type {string} code
     * @description 護理班別代碼簡稱
     * @member {string}
     */
    this.code = '';
    /**
     * @type {string} name
     * @description 護理班別名稱
     * @member {string}
     */
    this.name = '';
    /**
     * @type {string} startedAt
     * @description 護理班別起始時間HH:mm
     * @member {string}
     */
    this.startedAt = '';
    /**
     * @type {string} endedAt
     * @description 護理班別結束時間HH:mm
     * @member {string}
     */
    this.endedAt = '';
    /**
     * @type {string} isDayOff
     * @description 護理班別是否為休息班
     * @member {string}
     */
    this.isDayOff = '';
  }

  bind(data) {
    super.bind(data, this);
    if (data.id) { this.nursingShiftId = data.id; }
    return this;
  }

  bindDBObjectId(data) {
    super.bind(data, this);
    this.nursingShiftId = data.nursingShiftId ? data.nursingShiftId.toString() : '';
    return this;
  }
}

module.exports = NursingShiftObject;
