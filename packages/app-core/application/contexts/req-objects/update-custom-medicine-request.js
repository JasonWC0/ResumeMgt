/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-medicine-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-09 06:02:47 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle, CustomError } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, FileObject } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class UpdateCustomMedicineRequest extends BaseBundle {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
    * @type {string} indications
    * @description 適應症、臨床用途
    */
    this.indications = '';
    /**
    * @type {string} sideEffects
    * @description 副作用
    */
    this.sideEffects = '';
    /**
    * @type {string} healthEducation
    * @description 衛教重點
    */
    this.healthEducation = '';
    /**
    * @type {string} storageConditions
    * @description 保存條件
    */
    this.storageConditions = '';
    /**
    * @type {string} usageInfo
    * @description 給藥途徑/作用部位，使用藥物的方法
    */
    this.usageInfo = '';
    /**
    * @type {string} remark
    * @description 備註
    */
    this.remark = '';
    /**
    * @type {array} images
    * @description 藥品圖片資料
    */
    this.images = [];
    /**
    * @type {boolean} isAvailable
    * @description 藥品啟用狀態
    */
    this.isAvailable = null;
  }

  bind(data = {}) {
    super.bind(data, this);
    this.images = CustomValidator.nonEmptyArray(this.images) ? data.images.map((d) => new FileObject().bind(d)) : [];
    this.isAvailable = CustomValidator.isBoolean(this.isAvailable) ? this.isAvailable : true;
    return this;
  }

  checkRequired() {
    if (CustomValidator.nonEmptyArray(this.images)) {
      this.images.forEach((img) => {
        if (!CustomValidator.isEqual(img, new FileObject())) { img.checkRequired(); }
      });
    }
    return this;
  }

  checkUniField(field, data) {
    if (!Object.getOwnPropertyNames(this).includes(field)) { throw new CustomError(coreErrorCodes.ERR_MEDICINE_PARAM_NOT_ALLOWED); }
    if (!CustomValidator.nonEmptyObject(data) && !CustomValidator.isBoolean(data)) { throw new CustomError(coreErrorCodes.ERR_MEDICINE_PARAM_VALUE_IS_EMPTY); }
    if (CustomValidator.isEqual(field, 'isAvailable')) {
      CustomValidator.isBoolean(data, coreErrorCodes.ERR_MEDICINE_IS_AVAILABLE_WRONG_FORMAT);
    }
    const obj = {};
    obj[field] = data;
    return obj;
  }
}

module.exports = UpdateCustomMedicineRequest;
