/**
 * FeaturePath: Common-Entity--社區式服務個案物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const PlaceObject = require('./place-object');

/**
 * @class
 * @classdesc Represents dc of case object
 */
class CaseDcObject extends BaseBundle {
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
     * @type {Number} billPlaceType
     * @description 帳單地址類型
     * @member
     */
    this.billPlaceType = null;
    /**
     * @type {PlaceObject} billPlace
     * @description 帳單地址
     * @member
     */
    this.billPlace = new PlaceObject();
    /**
     * @type {String} billNote
     * @description 帳單備註
     * @member
     */
    this.billNote = '';
    /**
     * @type {Date} startDate
     * @description 服務開始日期
     * @member
     */
    this.startDate = null;
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
     * @type {String} careAttendantId
     * @description 照服員
     * @member
     */
    this.careAttendantId = null;
    /**
     * @type {String} locationName
     * @description 據點名稱
     * @member
     */
    this.locationName = null;
    /**
     * @type {String} outboundDriverId
     * @description 司機(去程)
     * @member
     */
    this.outboundDriverId = null;
    /**
     * @type {String} inboundDriverId
     * @description 司機(回程)
     * @member
     */
    this.inboundDriverId = null;
    /**
     * @type {String} outboundShuttleOwnExpenseItem
     * @description 交通車超額自費項目(去程)
     * @member
     */
    this.outboundShuttleOwnExpenseItem = null;
    /**
    * @type {String} inboundShuttleOwnExpenseItem
    * @description 交通車超額自費項目(回程)
    * @member
    */
    this.inboundShuttleOwnExpenseItem = null;
    /**
     * @type {Boolean} valid
     * @description 資料是否有效
     * @member
     */
    this.valid = true;
    /**
    * @type {string} code
    * @description 案號(程式產生)
    * @member
    */
    this.code = null;
    /**
    * @type {Date} openDate
    * @description 開案日期
    * @member
    */
    this.openDate = null;
    /**
    * @type {Number} approvedRatio
    * @description 補助額度%
    * @member
    */
    this.approvedRatio = null;
    /**
    * @type {Boolean} service10711Flag
    * @description 10711新支付
    * @member
    */
    this.service10711Flag = null;
    /**
    * @type {Number} driverPriority
    * @description 個案接送順序優先權 (for 日照交通車)
    * @member
    */
    this.driverPriority = null;
    /**
    * @type {ObjectId} evaluateCaseId
    * @description 收托前評估人Id (日照)
    * @member
    */
    this.evaluateCaseId = null;
  }

  /**
   * @method
   * @description bind CaseDcObject
   * @param {objet} data
   * @returns {CaseDcObject} this
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
      billPlaceType: this.billPlaceType,
      billPlace: this.billPlace,
      billNote: this.billNote,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status,
      careAttendantId: this.careAttendantId,
      locationName: this.locationName,
      outboundDriverId: this.outboundDriverId,
      inboundDriverId: this.inboundDriverId,
      outboundShuttleOwnExpenseItem: this.outboundShuttleOwnExpenseItem,
      inboundShuttleOwnExpenseItem: this.inboundShuttleOwnExpenseItem,
    };
  }
}

module.exports = CaseDcObject;
