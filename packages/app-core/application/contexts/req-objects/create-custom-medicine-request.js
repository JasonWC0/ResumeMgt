/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-custom-medicine-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-10 02:21:51 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const UpdateCustomMedicineRequest = require('./update-custom-medicine-request');
const { coreErrorCodes, customMedicineCategoryCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class CreateCustomMedicineRequest extends UpdateCustomMedicineRequest {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
     * @type {number} category
     * @description 藥品類型
     */
    this.category = null;
    /**
     * @type {string} companyId
     * @description 機構Id
     */
    this.companyId = '';
    /**
     * @type {string} sharedMedicineId
     * @description 共用藥品資料庫Id
     */
    this.sharedMedicineId = '';
    /**
     * @type {string} drugCode
     * @description 藥品代碼
     */
    this.drugCode = '';
    /**
     * @type {string} atcCode
     * @description ATC碼
     */
    this.atcCode = '';
    /**
     * @type {string} licenseCode
     * @description 許可證號
     */
    this.licenseCode = '';
    /**
     * @type {string} chineseName
     * @description 中文藥名
     */
    this.chineseName = '';
    /**
     * @type {string} englishName
     * @description 英文藥名
     */
    this.englishName = '';
    /**
     * @type {string} genericName
     * @description 藥品學名
     */
    this.genericName = '';
    /**
     * @type {string} form
     * @description 劑型
     */
    this.form = '';
    /**
     * @type {number} doses
     * @description 劑量
     */
    this.doses = null;
    /**
     * @type {string} doseUnit
     * @description 劑量單位
     */
    this.doseUnit = '';
  }

  checkRequired() {
    super.checkRequired();
    new CustomValidator()
      .checkThrows(this.category,
        { fn: (val) => Object.values(customMedicineCategoryCodes).includes(val), m: coreErrorCodes.ERR_CUSTOM_MEDICINE_CATEGORY_NOT_EXIST })
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .nonEmptyStringThrows(this.chineseName, coreErrorCodes.ERR_CHINESE_NAME_IS_EMPTY)
      .nonEmptyStringThrows(this.englishName, coreErrorCodes.ERR_ENGLISH_NAME_IS_EMPTY);

    if (CustomValidator.isEqual(this.category, customMedicineCategoryCodes.shared)) {
      new CustomValidator()
        .nonEmptyStringThrows(this.sharedMedicineId, coreErrorCodes.ERR_SHARED_MEDICINE_ID_IS_EMPTY);
    }

    if (this.doses) {
      new CustomValidator()
        .checkThrows(this.doses,
          { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_DOSES_WRONG_FORMAT });
    }
    return this;
  }
}

module.exports = CreateCustomMedicineRequest;
