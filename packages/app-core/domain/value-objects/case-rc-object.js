/**
 * FeaturePath: Common-Entity--居住式服務個案物件
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
 * @classdesc Represents rc of case object
 */
class CaseRcObject extends BaseBundle {
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
     * @type {Array} pipelineService
     * @description 管路服務
     * @member
     */
    this.pipelineService = [];
    /**
     * @type {Number} rcServiceItem
     * @description 服務項目
     * @member
     */
    this.rcServiceItem = null;
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
     * @type {Date} scheduledStartDate
     * @description 預計服務開始時間
     * @member
     */
    this.scheduledStartDate = new Date();
    /**
     * @type {Date} scheduledEndDate
     * @description 預計服務結束時間
     * @member
     */
    this.scheduledEndDate = new Date();
    /**
     * @type {String} roomType
     * @description 房型
     * @member
     */
    this.roomType = null;
    /**
     * @type {String} roomNo
     * @description 房號
     * @member
     */
    this.roomNo = null;
    /**
     * @type {String} bedNo
     * @description 床號
     * @member
     */
    this.bedNo = null;
    /**
     * @type {Boolean} evaluated
     * @description 是否已評估
     * @member
     */
    this.evaluated = null;
    /**
     * @type {Array} historyRecord
     * @description 歷史紀錄
     * @member
     */
    this.historyRecord = [];
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
    * @type {ObjectId} evaluateCaseId
    * @description 收托前評估人Id (日照)
    * @member
    */
    this.evaluateCaseId = null;
  }

  /**
   * @method
   * @description bind CaseRcObject
   * @param {objet} data
   * @returns {CaseRcObject} this
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
      pipelineService: this.pipelineService,
      rcServiceItem: this.rcServiceItem,
      livingWith: this.livingWith,
      billPlaceType: this.billPlaceType,
      billPlace: this.billPlace,
      billNote: this.billNote,
      scheduledStartDate: this.scheduledStartDate,
      scheduledEndDate: this.scheduledEndDate,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status,
      roomType: this.roomType,
      roomNo: this.roomNo,
      bedNo: this.bedNo,
      evaluated: this.evaluated,
      historyRecord: this.historyRecord.map((hr) => hr.toView()),
    };
  }
}

module.exports = CaseRcObject;
