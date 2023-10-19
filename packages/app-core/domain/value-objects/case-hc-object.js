/**
 * FeaturePath: Common-Entity--居家式服務個案物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const PlaceObject = require('./place-object');
const CustumServiceTimeObject = require('./custum-service-time-object')

/**
 * @class
 * @classdesc Represents hc of case object
 */
class CaseHcObject extends BaseBundle {
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
    this.syncVitalSignToDM = false;
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
     * @type {ObjectId} masterHomeservicerId
     * @description 主責居服員
     * @member
     */
    this.masterHomeservicerId = null;
    /**
     * @type {ObjectId} supervisorId
     * @description 主督導員
     * @member
     */
    this.supervisorId = null;
    /**
     * @type {ObjectId} subSupervisorId
     * @description 副督導員
     * @member
     */
    this.subSupervisorId = null;
    /**
    * @type {Number} companyDistance
    * @description 和機構的距離
    * @member
    */
    this.companyDistance = null;
    /**
    * @type {Boolean} residencePlacebyCoordinate
    * @description 服務地址 - 經緯度是否手動輸入
    * @member
    */
    this.residencePlacebyCoordinate = null;
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
    * @type {Object} serviceTimeRequired
    * @description 自訂服務項目時間
    * @member
    */
    this.serviceTimeRequired = null;
    /**
    * @type {number} welfareType
    * @description 福利別(機構客製)
    * @member
    */
    this.welfareType = null;
    /**
    * @type {number} paymentMethod
    * @description 繳款方式(宜蘭康活、宜蘭舒活客製功能)
    * @member
    */
    this.paymentMethod = null;
    /**
    * @type {number} additionalSource
    * @description 來源(天晟醫院金色年代客製)
    * @member
    */
    this.additionalSource = null;
    /**
    * @type {CustumServiceTimeObject} serviceItemSuggestSetting
    * @description 自訂服務項目時間
    * @member
    */
    this.serviceItemSuggestSetting = null;
    /**
    * @type {ObjectId} evaluateCaseId
    * @description 收托前評估人Id (日照)
    * @member
    */
    this.evaluateCaseId = null;
  }

  /**
   * @method
   * @description bind CaseHcObject
   * @param {objet} data
   * @returns {CaseHcObject} this
   */
  bind(data) {
    super.bind(data, this);
    if (data.billPlace) {
      this.billPlace = new PlaceObject().bind(data.billPlace);
    }
    if (data.serviceItemSuggestSetting) {
      this.serviceItemSuggestSetting = {
        GA09_1: data.serviceItemSuggestSetting?.GA09_1 ? new CustumServiceTimeObject().bind(data.serviceItemSuggestSetting.GA09_1) : null,
        BA02_10711_1: data.serviceItemSuggestSetting?.BA02_10711_1 ? new CustumServiceTimeObject().bind(data.serviceItemSuggestSetting.BA02_10711_1) : null,
        BA17d2_1: data.serviceItemSuggestSetting?.BA17d2_1 ? new CustumServiceTimeObject().bind(data.serviceItemSuggestSetting.BA17d2_1) : null,
        BA17d_1: data.serviceItemSuggestSetting?.BA17d_1 ? new CustumServiceTimeObject().bind(data.serviceItemSuggestSetting.BA17d_1) : null,
        BA17c_1: data.serviceItemSuggestSetting?.BA17c_1 ? new CustumServiceTimeObject().bind(data.serviceItemSuggestSetting.BA17c_1) : null,
        BA16_2_1: data.serviceItemSuggestSetting?.BA16_2_1 ? new CustumServiceTimeObject().bind(data.serviceItemSuggestSetting.BA16_2_1) : null,
        BA02_10711_2_1: data.serviceItemSuggestSetting?.BA02_10711_2_1 ? new CustumServiceTimeObject().bind(data.serviceItemSuggestSetting.BA02_10711_2_1) : null,
      }
    }
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
      masterHomeservicerId: this.masterHomeservicerId,
      supervisorId: this.supervisorId,
      subSupervisorId: this.subSupervisorId,
    };
  }
}

module.exports = CaseHcObject;
