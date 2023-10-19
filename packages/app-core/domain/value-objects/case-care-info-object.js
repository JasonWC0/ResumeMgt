/**
 * FeaturePath: Common-Entity--個案服務資訊物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const CaseManagerInfoObject = require('./case-manager-info-object');
const AOrgServiceItemObject = require('./aorg-service-item-object');

/**
 * @class
 * @classdesc Represents care info of case object
 */
class CaseCareInfoObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
    * @type {array} declaredServiceCategory
    * @description 申請服務種類
    * @member {array}
    */
    this.declaredServiceCategory = [];
    /**
    * @type {string} disease
    * @description 罹患疾病
    * @member {string}
    */
    this.disease = '';
    /**
    * @type {string} diseaseHistoryStr
    * @description 疾病史
    * @member {string}
    */
    this.diseaseHistoryStr = '';
    /**
    * @type {string} behaviorAndEmotion
    * @description 行為與情緒
    * @member {string}
    */
    this.behaviorAndEmotion = '';
    /**
    * @type {string} note
    * @description 備註
    * @member {string}
    */
    this.note = '';
    /**
     * @type {string} introduction
     * @description 簡述計畫
     * @member {string}
     */
    this.introduction = '';
    /**
     * @type {string} subjectChangeSummary
     * @description 主旨、異動摘要
     * @member {string}
     */
    this.subjectChangeSummary = '';
    /**
     * @type {string} changeReason
     * @description 異動原因
     * @member {string}
     */
    this.changeReason = '';
    /**
     * @type {string} introductionOfAOrg
     * @description Ａ單位: 計畫目標
     * @member {string}
     */
    this.introductionOfAOrg = '';
    /**
     * @type {string} executionOfAOrg
     * @description Ａ單位: 執行規劃
     * @member {string}
     */
    this.executionOfAOrg = '';
    /**
     * @type {string} noteOfAOrg
     * @description Ａ單位: 備註
     * @member {string}
     */
    this.noteOfAOrg = '';
    /**
     * @type {CaseManagerInfoObject} careManagerInfo
     * @description Ａ單位: 個管聯絡資訊
     * @member {CaseManagerInfoObject}
     */
    this.caseManagerInfo = null;
    /**
     * @type {Array<serviceItemOfAOrgObject>} serviceItemOfAOrg
     * @description Ａ單位: 個管聯絡資訊
     * @member {Array<serviceItemOfAOrgObject>}
     */
    this.serviceItemOfAOrg = [];
    /**
     * @type {Number} reliefType
     * @description 照顧計畫: 福利身分別
     * @member {Number}
     */
    this.reliefType = null;
  }

  /**
   * @method
   * @description bind CaseHcObject
   * @param {objet} data
   * @returns {CaseCareInfoObject} this
   */
  bind(data) {
    super.bind(data, this);
    if (data.caseManagerInfo) this.caseManagerInfo = new CaseManagerInfoObject().bind(data.caseManagerInfo);
    if (CustomValidator.nonEmptyArray(data.serviceItemOfAOrg)) this.serviceItemOfAOrg = data.serviceItemOfAOrg.map((s) => new AOrgServiceItemObject().bind(s));
    return this;
  }

  /**
  * @method
  * @description Return formated info
  * @returns {Object}
  */
  toView() {
    const dscTable = {
      1: '1.居家服務',
      2: '2.日間照顧服務',
      3: '3.家庭托顧服務',
      4: '4.社區式照顧服務',
      5: '5.專業服務',
      6: '6.交通接送服務',
      7: '7.輔具及居家無障礙改善服務',
      8: '8.喘息服務',
      9: '9.營養餐飲服務',
      10: '10.機構服務',
    };

    return {
      declaredServiceCategory: this.declaredServiceCategory.map((d) => dscTable[d]).join(' '),
      disease: this.disease,
      diseaseHistoryStr: this.diseaseHistoryStr,
      behaviorAndEmotion: this.behaviorAndEmotion,
      note: this.note,
      introduction: this.introduction,
      subjectChangeSummary: this.subjectChangeSummary,
      changeReason: this.changeReason,
      introductionOfAOrg: this.introductionOfAOrg,
      executionOfAOrg: this.executionOfAOrg,
      noteOfAOrg: this.noteOfAOrg,
      caseManagerInfo: this.caseManagerInfo,
      serviceItemOfAOrg: this.serviceItemOfAOrg,
      reliefType: this.reliefType,
    };
  }
}

module.exports = CaseCareInfoObject;
