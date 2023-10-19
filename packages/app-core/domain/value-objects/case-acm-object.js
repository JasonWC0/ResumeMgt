/**
 * FeaturePath: Common-Entity--A個管個案物件
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
 * @classdesc Represents hc of case object
 */
class CaseAcmObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {String} caseNumber
     * @description 個案編號
     * @member
     */
    this.caseNumber = null;
    /**
     * @type {Number} height
     * @description 身高
     * @member
     */
    this.height = null;
    /**
     * @type {Number} weight
     * @description 體重
     * @member
     */
    this.weight = null;
    /**
     * @type {Number} calfGirth
     * @description 小腿圍
     * @member
     */
    this.calfGirth = null;
    /**
     * @type {String} category
     * @description 個案分類
     * @member
     */
    this.category = null;
    /**
     * @type {Number} source
     * @description 個案來源
     * @member
     */
    this.source = null;
    /**
     * @type {Number} reliefType
     * @description 福利身分別
     * @member
     */
    this.reliefType = null;
    /**
     * @type {Number} livingArrangement
     * @description 居住狀況
     * @member
     */
    this.livingArrangement = null;
    /**
     * @type {String} medicalRecordNumber
     * @description 病歷號碼
     * @member
     */
    this.medicalRecordNumber = null;
    /**
     * @type {Boolean} syncVitalSignToDM
     * @description 同步生理數據
     * @member
     */
    this.syncVitalSignToDM = null;
    /**
     * @type {String} livingWith
     * @description 同住人員
     * @member
     */
    this.livingWith = null;
    /**
     * @type {Date} importDate
     * @description 匯入日期
     * @member
     */
    this.importDate = null;
    /**
     * @type {Date} endDate
     * @description 服務結束日期
     * @member
     */
    this.endDate = null;
    /**
     * @type {Number} status
     * @description 個案狀態
     * @member
     */
    this.status = 0;
    /**
     * @type {String} caseManagerId
     * @description 主責個管員ID
     * @member
     */
    this.caseManagerId = null;
    /**
     * @type {String} subCaseManagerId
     * @description 副個管員ID
     * @member
     */
    this.subCaseManagerId = null;
    /**
     * @type {String} careManagerId
     * @description 照管員ID
     * @member
     */
    this.careManagerId = null;
    /**
     * @type {Boolean} valid
     * @description 資料是否有效
     * @member
     */
    this.valid = true;
  }

  /**
   * @method
   * @description bind CaseAcmObject
   * @param {objet} data
   * @returns {CaseAcmObject} this
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
      caseNumber: this.caseNumber,
      height: this.height,
      weight: this.weight,
      calfGirth: this.calfGirth,
      category: this.category,
      source: this.source,
      reliefType: this.reliefType,
      livingArrangement: this.livingArrangement,
      medicalRecordNumber: this.medicalRecordNumber,
      syncVitalSignToDM: this.syncVitalSignToDM,
      livingWith: this.livingWith,
      importDate: this.importDate,
      endDate: this.endDate,
      status: this.status,
      caseManagerId: this.caseManagerId,
      subCaseManagerId: this.subCaseManagerId,
      careManagerId: this.careManagerId,
    };
  }
}

module.exports = CaseAcmObject;
