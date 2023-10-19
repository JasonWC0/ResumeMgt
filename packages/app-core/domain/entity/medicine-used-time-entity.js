/**
 * FeaturePath: Common-Entity--機構常用藥時間
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-used-time-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-08 11:59:43 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const BaseEntity = require('./base-entity');

/**
 * @class
 * @classdesc MedicineUsedTimeEntity
 */
class MedicineUsedTimeEntity extends BaseEntity {
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
     * @type {string} beforeBreakfast
     * @description 早餐前時間
     * @member
     */
    this.beforeBreakfast = '';
    /**
     * @type {string} afterBreakfast
     * @description 早餐後時間
     * @member
     */
    this.afterBreakfast = '';
    /**
     * @type {string} beforeLunch
     * @description 午餐前時間
     * @member
     */
    this.beforeLunch = '';
    /**
     * @type {string} afterLunch
     * @description 午餐後時間
     * @member
     */
    this.afterLunch = '';
    /**
     * @type {string} beforeDinner
     * @description 晚餐前時間
     * @member
     */
    this.beforeDinner = '';
    /**
     * @type {string} afterDinner
     * @description 晚餐後時間
     * @member
     */
    this.afterDinner = '';
    /**
     * @type {string} beforeBedtime
     * @description 睡前時間
     * @member
     */
    this.beforeBedtime = '';
  }

  bindDBObjectId(data) {
    super.bind(data, this);
    if (data.companyId) {
      this.companyId = data.companyId.toString();
    }
    return this;
  }

  toView(defaultValue) {
    return {
      beforeBreakfast: CustomValidator.nonEmptyString(this.beforeBreakfast) ? this.beforeBreakfast : defaultValue.beforeBreakfast,
      afterBreakfast: CustomValidator.nonEmptyString(this.afterBreakfast) ? this.afterBreakfast : defaultValue.afterBreakfast,
      beforeLunch: CustomValidator.nonEmptyString(this.beforeLunch) ? this.beforeLunch : defaultValue.beforeLunch,
      afterLunch: CustomValidator.nonEmptyString(this.afterLunch) ? this.afterLunch : defaultValue.afterLunch,
      beforeDinner: CustomValidator.nonEmptyString(this.beforeDinner) ? this.beforeDinner : defaultValue.beforeDinner,
      afterDinner: CustomValidator.nonEmptyString(this.afterDinner) ? this.afterDinner : defaultValue.afterDinner,
      beforeBedtime: CustomValidator.nonEmptyString(this.beforeBedtime) ? this.beforeBedtime : defaultValue.beforeBedtime,
      vn: this.__vn,
    };
  }
}

module.exports = MedicineUsedTimeEntity;
