/**
 * FeaturePath: Common-Entity--客製藥品資料
 * Accountable: JoyceS Hsu, AndyH Lai
 * 
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-medicine-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-09 04:25:11 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const BaseEntity = require('./base-entity');
const customMedicineCategoryCodes = require('../enums/custom-medicine-category-code');

/**
 * @class
 * @classdesc CustomMedicineEntity
 */
class CustomMedicineEntity extends BaseEntity {
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
     * @type {number} category
     * @description 藥品類別
     * @member
     */
    this.category = null;
    /**
     * @type {string} sharedMedicineId
     * @description 共用藥品資料庫Id
     * @member
     */
    this.sharedMedicineId = '';
    /**
     * @type {string} drugCode
     * @description 藥品代碼
     * @member
     */
    this.drugCode = '';
    /**
     * @type {string} atcCode
     * @description 藥品ATC碼
     * @member
     */
    this.atcCode = '';
    /**
     * @type {string} licenseCode
     * @description 藥品許可證號
     * @member
     */
    this.licenseCode = '';
    /**
     * @type {string} chineseName
     * @description 藥品中文名稱
     * @member
     */
    this.chineseName = '';
    /**
     * @type {string} englishName
     * @description 藥品英文名稱
     * @member
     */
    this.englishName = '';
    /**
     * @type {string} genericName
     * @description 藥品學名
     * @member
     */
    this.genericName = '';
    /**
     * @type {string} indications
     * @description 適應症
     * @member
     */
    this.indications = '';
    /**
     * @type {string} sideEffects
     * @description 副作用
     * @member
     */
    this.sideEffects = '';
    /**
     * @type {string} form
     * @description 劑型
     * @member
     */
    this.form = '';
    /**
     * @type {number} doses
     * @description 劑量
     * @member
     */
    this.doses = null;
    /**
     * @type {string} doseUnit
     * @description 劑量單位
     * @member
     */
    this.doseUnit = '';
    /**
     * @type {string} storageConditions
     * @description 儲存條件
     * @member
     */
    this.storageConditions = '';
    /**
     * @type {string} healthEducation
     * @description 衛教重點
     * @member
     */
    this.healthEducation = '';
    /**
     * @type {string} usageInfo
     * @description 用藥資訊
     * @member
     */
    this.usageInfo = '';
    /**
     * @type {string} remark
     * @description 藥品備註
     * @member
     */
    this.remark = '';
    /**
     * @type {array} images
     * @description 藥品照片
     * @member
     */
    this.images = [];
    /**
     * @type {boolean} isAvailable
     * @description 是否啟用
     * @member
     */
    this.isAvailable = null;
  }

  bindDBObjectId(data) {
    super.bind(data, this);
    if (data.companyId) {
      this.companyId = data.companyId.toString();
    }
    return this;
  }

  bindNHIData(data) {
    this.id = data.NHIDrugId;
    this.category = customMedicineCategoryCodes.shared;
    this.chineseName = data.drugNameCHT;
    this.englishName = data.drugName;
    this.drugCode = data.drugCode;
    this.form = data.drugType;
    this.doses = data.quantity;
    this.doseUnit = data.quantityUnit;
    this.isAvailable = true;
    return this;
  }

  withDrugCode(drugCode) {
    this.drugCode = drugCode;
    return this;
  }

  toView() {
    return {
      category: this.category,
      drugCode: this.drugCode,
      atcCode: this.atcCode,
      licenseCode: this.licenseCode,
      chineseName: this.chineseName,
      englishName: this.englishName,
      genericName: this.genericName,
      indications: this.indications,
      sideEffects: this.sideEffects,
      form: this.form,
      doses: this.doses,
      doseUnit: this.doseUnit,
      healthEducation: this.healthEducation,
      storageConditions: this.storageConditions,
      usageInfo: this.usageInfo,
      remark: this.remark,
      images: this.images.map((i) => ({
        id: i.id,
        publicUrl: i.publicUrl,
        mimeType: i.mimeType,
      })),
      isAvailable: this.isAvailable,
      vn: this.__vn,
    };
  }
}

module.exports = CustomMedicineEntity;
