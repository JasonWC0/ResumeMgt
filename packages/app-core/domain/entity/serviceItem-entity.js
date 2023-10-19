/**
 * FeaturePath: Common-Entity--服務項目
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { ObjectId } = require('mongoose').Types;
const BaseEntity = require('./base-entity');
const ServiceOptionObject = require('../value-objects/service-option-object');

class ServiceItemEntity extends BaseEntity {
  constructor() {
    super();
    /**
     * @type {string} companyId
     * @description 公司id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} serviceCode
     * @description 項目編號
     * @member
     */
    this.serviceCode = '';
    /**
     * @type {string} serviceName
     * @description 照顧組合
     * @member
     */
    this.serviceName = null;
    /**
     * @type {string} serviceExclude
     * @description 互斥項目
     * @member
     */
    this.serviceExclude = null;
    /**
     * @type {string} serviceRely
     * @description 依賴項目
     * @member
     */
    this.serviceRely = null;
    /**
     * @type {Number} time
     * @description 所需時間
     * @member
     */
    this.time = null;
    /**
     * @type {Number} unit
     * @description 執行幾次為一單位
     * @member
     */
    this.unit = null;
    /**
     * @type {string} servicerCert
     * @description 居服員俱備條件
     * @member
     */
    this.servicerCert = null;
    /**
     * @type {Number} cost
     * @description 費用
     * @member
     */
    this.cost = null;
    /**
     * @type {Number} aboriginalCost
     * @description 離島費用
     * @member
     */
    this.aboriginalCost = null;
    /**
     * @type {Number} cms
     * @description 適用cms等級
     * @member
     */
    this.cms = null;
    /**
     * @type {Number} serviceCategory
     * @description 分類[0: 1: 居服, 2:日照]
     * @member
     */
    this.serviceCategory = null;
    /**
     * @type {Number} timeRequired
     * @description 服務時間預設值[支付計算機用]
     * @member
     */
    this.timeRequired = null;
    /**
     * @type {Boolean} dayoff
     * @description 服務時間預設值[支付計算機用]
     * @member
     */
    this.dayoff = false;
    /**
     * @type {String} periodUnit
     * @description 加計單位
     * @member
     */
    this.periodUnit = '';
    /**
     * @type {String} servicePeriod
     * @description 服務時間範圍
     * @member
     */
    this.servicePeriod = '';
    /**
     * @type {String} systemAuto
     * @description 系統自動判斷
     * @member
     */
    this.systemAuto = false;
    /**
     * @type {Number} cmsLimit
     * @description 最低適用CMS等級
     * @member
     */
    this.cmsLimit = false;
    /**
     * @type {String} city
     * @description 縣市
     * @member
     */
    this.city = false;
    /**
     * @type {Array<ServiceOptionObject>} serviceOption
     * @description 選項
     * @member
     */
    this.serviceOption = [];
    /**
     * @type {Boolean} customDefault
     * @description 自訂項目: 是否為預設項目
     * @member
     */
    this.customDefault = false;
    /**
     * @type {Number} lowPay
     * @description 民眾單價(低收)
     * @member
     */
    this.lowPay = null;
    /**
     * @type {Number} middlePay
     * @description 民眾單價(中低收)
     * @member
     */
    this.middlePay = null;
    /**
     * @type {Number} normalPay
     * @description 民眾單價(一般戶)
     * @member
     */
    this.normalPay = null;
    /**
     * @type {Array<object>} serviceVersion
     * @description 項目版本(配合10711新制), 1:10701的制度 , 2:10711的新制
     * @member
     */
    this.serviceVersion = [];
    /**
     * @type {Boolean} fixedTimeFlag
     * @description 固定時間(項目需做滿該時數，方能在紀錄計算為1次)
     * @member
     */
    this.fixedTimeFlag = false;
    /**
     * @type {String} departFrom
     * @description 拆站前公司Id
     * @member
     */
    this.departFrom = null;
    /**
     * @type {Array<Number>} supportPingtungReport
     * @description 此服務項目支援的屏東中央服務紀錄客製化類型
     * @member
     */
    this.supportPingtungReport = [];
    /**
     * @type {String} reportName
     * @description 報表顯示名稱
     * @member
     */
    this.reportName = '';
    /**
     * @type {Array<String>} serviceCombine
     * @description 合併加計項目
     * @member
     */
    this.serviceCombine = [];
    /**
     * @type {Boolean} trainingRequired
     * @description 是否需要具備相關訓練與證照
     * @member
     */
    this.trainingRequired = false;
    /**
     * @type {ObjectId} creator
     * @description 建立人
     * @member
     */
    this.creator = null;
    /**
     * @type {ObjectId} modifier
     * @description 編輯人
     * @member
     */
    this.modifier = null;
    /**
     * @type {ObjectId} deleter
     * @description 刪除人
     * @member
     */
    this.deleter = null;
  }

  bind(data) {
    super.bind(data, this);
    if (data.serviceOption) { this.serviceOption = data.serviceOption.map((so) => new ServiceOptionObject().bind(so)); }
    return this;
  }

  bindDBCompanyId(companyId = '') {
    this.companyId = companyId;
    return this;
  }

  bindServiceCode(serviceCode = '') {
    this.serviceCode = serviceCode;
    return this;
  }

  bindCreator(creator = '') {
    this.creator = ObjectId(creator);
    return this;
  }

  bindModifier(modifier = '') {
    this.modifier = ObjectId(modifier);
    return this;
  }

  bindDeleter(deleter = '') {
    this.deleter = ObjectId(deleter);
    return this;
  }

  pushServiceOption(serviceOption = new ServiceOptionObject()) {
    this.serviceOption.push(serviceOption);
    return this;
  }

  toView() {
    return {
      id: this.id,
      companyId: this.companyId,
      serviceCode: this.serviceCode,
      serviceName: this.serviceName,
      serviceExclude: this.serviceExclude,
      description: this.serviceOption && this.serviceOption.length > 0 ? this.serviceOption[0].description : '',
      serviceRely: this.serviceRely,
      time: this.time,
      unit: this.unit,
      servicerCert: this.servicerCert,
      cost: this.cost,
      aboriginalCost: this.aboriginalCost,
      cms: this.cms,
      serviceCategory: this.serviceCategory,
      timeRequired: this.timeRequired,
      dayoff: this.dayoff,
      periodUnit: this.periodUnit,
      servicePeriod: this.servicePeriod,
      systemAuto: this.systemAuto,
      cmsLimit: this.cmsLimit,
      city: this.city,
      serviceOption: this.serviceOption.map((so) => so.toView()),
      customDefault: this.customDefault,
      lowPay: this.lowPay,
      middlePay: this.middlePay,
      normalPay: this.normalPay,
      serviceVersion: this.serviceVersion,
      fixedTimeFlag: this.fixedTimeFlag,
      departFrom: this.departFrom,
      supportPingtungReport: this.supportPingtungReport,
      reportName: this.reportName,
      serviceCombine: this.serviceCombine,
      trainingRequired: this.trainingRequired,
      creator: this.creator,
      modifier: this.modifier,
      deleter: this.deleter,
      vn: this.__vn,
    };
  }
}

module.exports = ServiceItemEntity;
