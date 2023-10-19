/**
 * FeaturePath: Common-Entity--用藥紀錄內的藥品物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-record-med-object.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-22 03:13:55 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class MedicineRecordMedObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} medicineId
     * @description 自訂藥品Id
     * @member {string}
     */
    this.medicineId = '';
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
     * @type {string} indications
     * @description 適應症
     * @member
     */
    this.indications = '';
    /**
     * @type {string} usageInfo
     * @description 用藥資訊
     * @member
     */
    this.usageInfo = '';
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
     * @type {string} quantityOfMedUse
     * @description 用量
     * @member {string}
     */
    this.quantityOfMedUse = '';
    /**
     * @type {object} useFreq
     * @description 用藥頻率
     * @member {object}
     */
    this.useFreq = {
      /**
      * @type {number} type
      * @description 用藥頻率類型
      * @member {number}
      */
      type: null,
      /**
      * @type {} content
      * @description 用藥頻率內容
      * @member {}
      */
      content: null,
    };
    /**
     * @type {object} useTiming
     * @description 用藥時間
     * @member {object}
     */
    this.useTiming = {
      /**
      * @type {number} type
      * @description 用藥時間類型
      * @member {number}
      */
      type: null,
      /**
       * @type {} content
       * @description 用藥時間內容
       * @member {}
       */
      content: null,
    };
    /**
     * @type {boolean} isUsed
     * @description 是否使用藥
     * @member {boolean}
     */
    this.isUsed = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  bindObjectId(data) {
    super.bind(data, this);
    this.medicineId = data.medicineId ? data.medicineId.toString() : '';
  }
}

module.exports = MedicineRecordMedObject;
