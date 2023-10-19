/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-medicine-plan-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-16 06:13:00 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, MedicinePlanMedObject, FileObject } = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class UpdateMedicinePlanRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} caseName
     * @description 個案姓名
     */
    this.caseName = '';
    /**
     * @type {string} planName
     * @description 用藥計畫名稱
     */
    this.planName = '';
    /**
     * @type {string} workerId
     * @description 施藥人員Id
     */
    this.workerId = '';
    /**
     * @type {string} workerName
     * @description 施藥人員姓名
     */
    this.workerName = '';
    /**
     * @type {boolean} autoAddHospital
     * @description 自動新增至常用醫院/診所
     */
    this.autoAddHospital = false;
    /**
     * @type {string} hospital
     * @description 醫院/診所
     */
    this.hospital = '';
    /**
     * @type {boolean} autoAddDoctor
     * @description 自動新增至常用醫生姓名
     */
    this.autoAddDoctor = false;
    /**
     * @type {string} doctor
     * @description 醫生姓名
     */
    this.doctor = '';
    /**
     * @type {string} planStartDate
     * @description 用藥計畫開始日期
     */
    this.planStartDate = '';
    /**
     * @type {string} planEndDate
     * @description 用藥計畫結束日期
     */
    this.planEndDate = '';
    /**
     * @type {array} medicines
     * @description 藥品列表
     */
    this.medicines = [];
    /**
     * @type {string} remark
     * @description 備註
     */
    this.remark = '';
    /**
     * @type {array} images
     * @description 用藥計畫圖片
     */
    this.images = [];
  }

  bind(data = {}) {
    super.bind(data, this);
    const hasMedicines = (data.medicines && CustomValidator.nonEmptyArray(data.medicines));
    const hasImages = (data.images && CustomValidator.nonEmptyArray(data.images));
    this.medicines = hasMedicines ? data.medicines.map((m) => new MedicinePlanMedObject().bind(m)) : [];
    this.images = hasImages ? data.images.map((i) => new FileObject().bind(i)) : [];
    this.autoAddHospital = CustomValidator.isBoolean(data.autoAddHospital) ? data.autoAddHospital : false;
    this.autoAddDoctor = CustomValidator.isBoolean(data.autoAddDoctor) ? data.autoAddDoctor : false;
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.planName, coreErrorCodes.ERR_MEDICINE_PLAN_NAME_IS_EMPTY)
      .nonEmptyStringThrows(this.caseName, coreErrorCodes.ERR_CASE_NAME_IS_EMPTY)
      .nonEmptyStringThrows(this.workerId, coreErrorCodes.ERR_WORKER_ID_IS_EMPTY)
      .nonEmptyStringThrows(this.workerName, coreErrorCodes.ERR_WORKER_NAME_IS_EMPTY)
      .checkThrows(this.planStartDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_START_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT })
      .checkThrows(this.planEndDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_END_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT })
      .checkThrows(this.medicines,
        { s: CustomValidator.strategies.NON_EMPTY_ARRAY, m: coreErrorCodes.ERR_MEDICINE_PLAN_MEDICINES_IS_EMPTY });

    this.medicines.forEach((m) => m.checkRequired());
    if (CustomValidator.nonEmptyArray(this.images)) {
      this.images.forEach((i) => i.checkRequired());
    }
    return this;
  }
}

module.exports = UpdateMedicinePlanRequest;
