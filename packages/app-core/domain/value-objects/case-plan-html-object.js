/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
/**
 * FeaturePath: Common-Entity--照顧計畫物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-plan-html-object.js
 * Project: @erpv3/app-core
 * File Created: 2022-06-16 04:06:48 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const moment = require('moment');
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const PlaceObject = require('./place-object');
const PaymentObject = require('./payment-object');
const DeclaredObject = require('./declared-object');
const SignOffSupervisorObject = require('./sign-off-supervisor-object');
const AOrgServiceItemObject = require('./aorg-service-item-object');
const CaseManagerInfoObject = require('./case-manager-info-object');
const EntitledDeclareObject = require('./entitled-declare-object');
const { caseMap, getNumberBooleanKey } = require('../enums/mapping');

/**
 * 資料依對照表轉換
 * @param {Object} maps 對照表
 * @param {Array} data 須轉換資料
 * @returns {Array}
 */
function _mapList(maps, data) {
  const _data = new Set();
  data.forEach((element) => {
    _data.add(getNumberBooleanKey(maps, element));
  });

  const _array = Array.from(_data);
  return (_array.length === 1 && _array[0] === null) ? [] : _array;
}

/**
 * 文字轉換數字
 * @param {String} data 文字資料
 * @returns {Number}
 */
function _mapNumber(data) {
  return /[0-9.]+/.test(data) ? Number(data.match(/[0-9.]+/)[0]) : null;
}

/**
 * 服務項目列表排序
 * @param {Array} data 服務項目列表
 * @returns {Array}
 */
function _sortServiceItem(data) {
  if (!data) { return []; }
  return data.sort((a, b) => {
    if (a.itemType > b.itemType) { return 1; }
    if (a.itemType < b.itemType) { return -1; }
    if (a.item > b.item) { return 1; }
    return -1;
  });
}

class RawRelationshipPerson extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} name
     * @description 姓名
     * @member {string}
     */
    this.name = '';
    /**
     * @type {string} personalId
     * @description 身分證字號
     * @member {string}
     */
    this.personalId = '';
    /**
     * @type {string} relationship
     * @description 關係
     * @member {string}
     */
    this.relationship = '';
    /**
     * @type {string} phoneH
     * @description 電話(H)
     * @member {string}
     */
    this.phoneH = '';
    /**
     * @type {string} phoneO
     * @description 電話(O)
     * @member {string}
     */
    this.phoneO = '';
    /**
     * @type {string} mobile
     * @description 手機號碼
     * @member {string}
     */
    this.mobile = '';
    /**
     * @type {string} email
     * @description 電子信箱
     * @member {string}
     */
    this.email = '';
    /**
     * @type {PlaceObject} residencePlace
     * @description 居住地址
     * @member {PlaceObject}
     */
    this.residencePlace = new PlaceObject();
    /**
     * @type {string} note
     * @description 註明
     * @member {string}
     */
    this.note = '';
  }

  /**
   * 綁定關係人資料
   * @param {Object} data 匯入建立資料
   * @returns {RawRelationshipPerson}
   */
  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
   * 由Html綁定關係人資料
   * @param {Object} data html資料
   * @returns {RawRelationshipPerson}
   */
  bindHtml(data) {
    super.bind(data, this);
    this.mobile = data.phoneC;
    this.relationship = data.relation;
    this.note = data.relationNote;
    this.residencePlace = new PlaceObject().bind(data.address);
    this.residencePlace.others = data.address.theRest;
    return this;
  }
}
class RawCaregiver extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} name
     * @description 姓名
     * @member {string}
     */
    this.name = '';
    /**
     * @type {string} relationship
     * @description 關係
     * @member {string}
     */
    this.relationship = '';
    /**
     * @type {number} gender
     * @description 性別
     * @member {number}
     */
    this.gender = null;
    /**
     * @type {number} age
     * @description 年齡
     * @member {number}
     */
    this.age = null;
  }

  /**
   * 綁定照顧者資料
   * @param {Object} data 匯入建立資料
   * @returns {RawCaregiver}
   */
  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
   * 由Html綁定[主要照顧者資料]
   * @param {Object} data html資料
   * @returns {RawCaregiver}
   */
  bindHtmlPrimary(data) {
    this.name = data.primaryName;
    this.relationship = data.primaryRelation;
    this.gender = getNumberBooleanKey(caseMap.genderMaps, data.primaryGender);
    this.age = data.primaryAge;
    return this;
  }

  /**
   * 由Html綁定[次要照顧者資料]
   * @param {Object} data html資料
   * @returns {RawCaregiver}
   */
  bindHtmlSecondary(data) {
    this.name = data.secondaryName;
    this.relationship = data.secondaryRelation;
    return this;
  }
}
class BasicInfo extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} name
     * @description 個案姓名
     * @member {string}
     */
    this.name = '';
    /**
     * @type {number} gender
     * @description 性別
     * @member {number}
     */
    this.gender = null;
    /**
     * @type {string} personalId
     * @description 身分證字號
     * @member {string}
     */
    this.personalId = '';
    /**
     * @type {string} birthDate
     * @description 生日
     * @member {string}
     */
    this.birthDate = '';
    /**
     * @type {string} mobile
     * @description 電話(手機)
     * @member {string}
     */
    this.mobile = '';
    /**
     * @type {number} height
     * @description 身高
     * @member {number}
     */
    this.height = null;
    /**
     * @type {number} weight
     * @description 體重
     * @member {number}
     */
    this.weight = null;
    /**
     * @type {number[]} languages
     * @description 常用語言
     * @member {number[]}
     */
    this.languages = [];
    /**
     * @type {number} aborigines
     * @description 原住民身份
     * @member {number}
     */
    this.aborigines = null;
    /**
     * @type {number} aboriginalRace
     * @description 原住民族別
     * @member {number}
     */
    this.aboriginalRace = null;
    /**
     * @type {PlaceObject} registerPlace
     * @description 戶籍地址
     * @member {PlaceObject}
     */
    this.registerPlace = new PlaceObject();
    /**
     * @type {PlaceObject} residencePlace
     * @description 居住地址
     * @member {PlaceObject}
     */
    this.residencePlace = new PlaceObject();
    /**
     * @type {number} education
     * @description 教育程度
     * @member {number}
     */
    this.education = null;
    /**
     * @type {number} livingArrangement
     * @description 居住狀況
     * @member {number}
     */
    this.livingArrangement = null;
    /**
     * @type {number[]} livingWith
     * @description 同住人員
     * @member {number[]}
     */
    this.livingWith = [];
    /**
     * @type {RawRelationshipPerson} agent
     * @description 代理人
     * @member {RawRelationshipPerson}
     */
    this.agent = new RawRelationshipPerson();
    /**
     * @type {RawRelationshipPerson[]} contacts
     * @description 聯絡人列表
     * @member {RawRelationshipPerson[]}
     */
    this.contacts = [];
    /**
     * @type {object} caregivers
     * @description 照顧者列表
     * @member {object}
     */
    this.caregivers = {
      /**
       * @type {RawCaregiver} primary
       * @description 主要照顧者
       * @member {RawCaregiver}
       */
      primary: new RawCaregiver(),
      /**
       * @type {RawCaregiver} secondary
       * @description 次要照顧者
       * @member {RawCaregiver}
       */
      secondary: new RawCaregiver(),
    };
  }

  /**
   * 地址新舊資料比較
   * @param {Object} newData 新資料
   * @param {Object} oldData 舊資料
   * @returns {Boolean}}
   */
  _compareAddress(newData, oldData) {
    // different is true
    const obj1 = new PlaceObject().bind(newData);
    const obj2 = new PlaceObject().bind(oldData);

    return !CustomValidator.isEqual(obj1, obj2);
  }

  /**
   * 個案資料新舊資料比較
   * @param {Object} newData 新資料
   * @param {Object} oldData 舊資料
   * @returns {BasicInfo}
   */
  compare(newData, oldData) {
    // different is true
    oldData.birthDate = moment(oldData.birthDate).format('YYYY/MM/DD');
    for (const k of Object.keys(this)) {
      if (['height', 'weight', 'livingArrangement', 'livingWith', 'registerPlace', 'residencePlace', 'agent', 'contacts', 'caregivers'].includes(k)) { continue; }
      this[k] = !((!(k in newData) && !(k in oldData)));
      if ((k in newData) && (k in oldData)) {
        this[k] = !CustomValidator.isEqual(newData[k], oldData[k]);
      }
    }

    // key in case service [array]
    const spKey = ['height', 'weight', 'livingArrangement', 'livingWith'];
    spKey.forEach((k) => {
      this[k] = !oldData[k].every((v) => CustomValidator.isEqual(v, newData[k]));
    });

    const addressField = ['registerPlace', 'residencePlace'];
    addressField.forEach((k1) => {
      this[k1] = !(k1 in newData) && !(k1 in oldData) ? false : this._compareAddress(newData[k1], oldData[k1]);
    });

    for (const k2 of Object.keys(this.agent)) {
      const notExist = (!('agent' in newData) && !('agent' in oldData)) || (!(k2 in newData.agent) && !(k2 in oldData.agent));
      if (k2 === 'residencePlace') {
        this.agent.residencePlace = notExist ? false : this._compareAddress(newData.agent.residencePlace, oldData.agent.residencePlace);
      } else {
        this.agent[k2] = notExist ? false : !CustomValidator.isEqual(newData.agent[k2], oldData.agent[k2]);
      }
    }

    for (const k2 of Object.keys(this.caregivers.primary)) {
      const notExist = (!('caregivers' in newData) && !('caregivers' in oldData))
                        || (!('primary' in newData.caregivers) && !('primary' in oldData.caregivers))
                        || (!(k2 in newData.caregivers.primary) && !(k2 in oldData.caregivers.primary));
      this.caregivers.primary[k2] = notExist ? false : !CustomValidator.isEqual(newData.caregivers.primary[k2], oldData.caregivers.primary[k2]);
    }

    for (const k2 of Object.keys(this.caregivers.secondary)) {
      const notExist = (!('caregivers' in newData) && !('caregivers' in oldData))
                        || (!('secondary' in newData.caregivers) && !('secondary' in oldData.caregivers))
                        || (!(k2 in newData.caregivers.secondary) && !(k2 in oldData.caregivers.secondary));
      this.caregivers.secondary[k2] = notExist ? false : !CustomValidator.isEqual(newData.caregivers.secondary[k2], oldData.caregivers.secondary[k2]);
    }

    if (!CustomValidator.nonEmptyArray(newData.contacts) && !CustomValidator.nonEmptyArray(oldData.contacts)) {
      this.contacts = false;
    } else {
      this.contacts = Array(newData.contacts.length);
      newData.contacts.forEach((c, index) => {
        this.contacts[index] = {};
        for (const k2 of Object.keys(new RawRelationshipPerson())) {
          const notExist = (oldData.contacts[index]) && (!(k2 in newData.contacts[index]) && !(k2 in oldData.contacts[index]));
          if (k2 === 'residencePlace') {
            this.contacts[index].residencePlace = {};
            this.contacts[index].residencePlace = notExist ? false : this._compareAddress(c.residencePlace, oldData.contacts[index].residencePlace);
          } else {
            this.contacts[index][k2] = notExist ? false : !CustomValidator.isEqual(c[k2], oldData.contacts[index][k2]);
          }
        }
      });
    }
    return this;
  }

  /**
   * 日期格式轉換
   * @param {String} data 日期
   * @returns {String}
   */
  mapDate(data) {
    return moment(data, 'YYYY-MM-DD').format('YYYY/MM/DD');
  }

  /**
   * 綁定Html戶籍地址
   * @param {Object} data html資料
   * @returns {Object}
   */
  bindHtmlRegister(data) {
    return {
      city: data.registeredAddress_city,
      region: data.registeredAddress_region,
      village: data.registeredAddress_village,
      neighborhood: data.registeredAddress_neighborhood,
      road: data.registeredAddress_road,
      others: data.registeredAddress_others,
    };
  }

  /**
   * 綁定Html居住地址
   * @param {Object} data html資料
   * @returns {Object}
   */
  bindHtmlResidence(data) {
    return {
      city: data.serviceAddress_city,
      region: data.serviceAddress_region,
      village: data.serviceAddress_village,
      neighborhood: data.serviceAddress_neighborhood,
      road: data.serviceAddress_road,
      others: data.serviceAddress_others,
    };
  }

  /**
   * 處理Html語言資料
   * @param {Array} data html資料
   * @returns {Array}
   */
  processLanguage(data) {
    return data.map((d) => {
      if (/[.,。，]$/.test(d)) {
        return d.slice(0, -1);
      }
      return d;
    });
  }

  /**
   * 由Html綁定個案基本資料
   * @param {Object} data html資料
   * @returns {BasicInfo}
   */
  bindHtml(data) {
    const { basicInfo, evaluation } = data;
    this.name = basicInfo.customer.name;
    this.gender = getNumberBooleanKey(caseMap.genderMaps, basicInfo.customer.gender);
    this.personalId = basicInfo.customer.personalId;
    this.birthDate = this.mapDate(basicInfo.customer.birthday);
    this.mobile = basicInfo.customer.phone;
    this.height = _mapNumber(basicInfo.customer.height);
    this.weight = _mapNumber(basicInfo.customer.weight);

    this.education = getNumberBooleanKey(caseMap.educationMaps, basicInfo.education);
    this.languages = _mapList(caseMap.languageMaps, this.processLanguage(basicInfo.customer.language));
    this.livingArrangement = getNumberBooleanKey(caseMap.caseLivingArrangementMaps, basicInfo.customer.livingSituation);
    this.livingWith = _mapList(caseMap.caseLivingWithMaps, basicInfo.customer.livingPartner);
    this.aborigines = getNumberBooleanKey(caseMap.aborigineMaps, basicInfo.customer.aboriginalIdentity);
    this.aboriginalRace = getNumberBooleanKey(caseMap.aboriginalRaceMaps, basicInfo.customer.aboriginalRace);
    this.registerPlace = new PlaceObject().bind(this.bindHtmlRegister(basicInfo.customer));
    this.residencePlace = new PlaceObject().bind(this.bindHtmlResidence(basicInfo.customer));
    this.agent = new RawRelationshipPerson().bindHtml(basicInfo.agent);
    this.contacts = [new RawRelationshipPerson().bindHtml(basicInfo.contact)];
    this.caregivers = {
      primary: new RawCaregiver().bindHtmlPrimary(evaluation.helper),
      secondary: new RawCaregiver().bindHtmlSecondary(evaluation.helper),
    };
    return this;
  }

  /**
   * 綁定個案基本資料
   * @param {Object} data 匯入建立資料
   * @returns {BasicInfo}
   */
  bind(data) {
    super.bind(data, this);
    return this;
  }
}
class RawServiceItem extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} item
     * @description 項目
     * @member {string}
     */
    this.item = '';
    /**
     * @type {number} cost
     * @description 金額
     * @member {number}
     */
    this.cost = null;
    /**
     * @type {number} amount
     * @description 數量
     * @member {number}
     */
    this.amount = null;
    /**
     * @type {number} total
     * @description 小計
     * @member {number}
     */
    this.total = null;
    /**
     * @type {string} itemType
     * @description 服務項目類別
     * @member {string}
     */
    this.itemType = null;
    /**
     * @type {boolean} newItem
     * @description 新服務項目
     * @member {boolean}
     */
    this.newItem = null;
  }

  /**
   * 由Html綁定照顧計畫服務項目
   * @param {Object} data html資料
   * @returns {RawServiceItem}
   */
  bindHtml(data) {
    super.bind(data, this);
    this.cost = Number(data.price);
    this.amount = Number(this.amount);
    this.total = Number(this.total);
    return this;
  }
}
class CarePlan extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} version
     * @description 合約版本
     * @member {string}
     */
    this.version = '';
    /**
     * @type {boolean} disabilityCategoryType
     * @description 身障類別制度(新/舊)
     * @member {boolean}
     */
    this.disabilityCategoryType = null;
    /**
     * @type {number[]} newDisabilityCategories
     * @description 身障類別(新)
     * @member {number[]}
     */
    this.newDisabilityCategories = [];
    /**
     * @type {string} oldDisabilityCategories
     * @description 身障類別(舊)
     * @member {string}
     */
    this.oldDisabilityCategories = '';
    /**
     * @type {number[]} oldDisabilityCategoriesList
     * @description 身障類別(舊列表)
     * @member {number[]}
     */
    this.oldDisabilityCategoriesList = [];
    /**
     * @type {number[]} disabilityCategories
     * @description 障礙類別(身障類別-新||ICF資料介接)
     * @member {number[]}
     */
    this.disabilityCategories = [];
    /**
     * @type {number[]} icd
     * @description ICD診斷
     * @member {number[]}
     */
    this.icd = [];
    /**
     * @type {string} icdOthers
     * @description ICD其他診斷
     * @member {string}
     */
    this.icdOthers = '';
    /**
     * @type {number} disability
     * @description 障礙等級
     * @member {number}
     */
    this.disability = null;
    /**
     * @type {boolean} isIntellectualDisability
     * @description 是否符合心智障礙
     * @member {boolean}
     */
    this.isIntellectualDisability = null;
    /**
     * @type {number} reliefType
     * @description 福利身份別
     * @member {number}
     */
    this.reliefType = null;
    /**
     * @type {number} cmsLevel
     * @description CMS等級
     * @member {number}
     */
    this.cmsLevel = null;
    /**
     * @type {PaymentObject} bcPayment
     * @description 照顧及專業服務(BC碼)
     * @member {PaymentObject}
     */
    this.bcPayment = new PaymentObject();
    /**
     * @type {PaymentObject} gPayment
     * @description 喘息服務(G碼)
     * @member {PaymentObject}
     */
    this.gPayment = new PaymentObject();
    /**
     * @type {number} pricingType
     * @description 計價類別
     * @member {number}
     */
    this.pricingType = null;
    /**
     * @type {object} foreignCareSPAllowance
     * @description 外籍看護+特照津貼
     * @member {object}
     */
    this.foreignCareSPAllowance = {
      foreignCare: null,
      specialAllowance: null,
    };
    /**
     * @type {boolean} disabilityCertification
     * @description 身心障礙失智症手冊
     * @member {boolean}
     */
    this.disabilityCertification = null;
    /**
     * @type {DeclaredObject} AA08Declared
     * @description AA08申報
     * @member {DeclaredObject}
     */
    this.AA08Declared = new DeclaredObject();
    /**
     * @type {DeclaredObject} AA09Declared
     * @description AA09申報
     * @member {DeclaredObject}
     */
    this.AA09Declared = new DeclaredObject();
    /**
     * @type {boolean} useBA12
     * @description 使用BA12
     * @member {boolean}
     */
    this.useBA12 = null;
    /**
     * @type {RawServiceItem[]} serviceItems
     * @description 服務項目
     * @member {RawServiceItem[]}
     */
    this.serviceItems = [];
    /**
     * @type {SignOffSupervisorObject[]} signOffSupervisor
     * @description 簽審督導列表
     * @member {SignOffSupervisorObject[]}
     */
    this.signOffSupervisor = [];
    /**
     * @type {string} subjectChangeSummary
     * @description 主旨、異動摘要
     * @member {string}
     */
    this.subjectChangeSummary = '';
    /**
     * @type {string} changeReason
     * @description 計畫異動原因
     * @member {string}
     */
    this.changeReason = '';
    /**
     * @type {string} introduction
     * @description 簡述計畫
     * @member {string}
     */
    this.introduction = '';
    /**
     * @type {string} introductionOfAOrg
     * @description A單位計畫簡述
     * @member {string}
     */
    this.introductionOfAOrg = '';
    /**
     * @type {number[]} declaredServiceCategory
     * @description 申請服務種類
     * @member {number[]}
     */
    this.declaredServiceCategory = [];
    /**
     * @type {EntitledDeclareObject} AA05EntitledDeclared
     * @description AA05申報資格
     * @member {EntitledDeclareObject}
     */
    this.AA05EntitledDeclared = new EntitledDeclareObject();
    /**
     * @type {EntitledDeclareObject} AA06EntitledDeclared
     * @description AA06申報資格
     * @member {EntitledDeclareObject}
     */
    this.AA06EntitledDeclared = new EntitledDeclareObject();
    /**
     * @type {EntitledDeclareObject} AA07EntitledDeclared
     * @description AA07申報資格
     * @member {EntitledDeclareObject}
     */
    this.AA07EntitledDeclared = new EntitledDeclareObject();
    /**
     * @type {number[]} serviceCategoryOfACM
     * @description A個管申請服務種類
     * @member {number[]}
     */
    this.serviceCategoryOfACM = [];
    /**
     * @type {string} disease
     * @description 罹患疾病
     * @member {string}
     */
    this.disease = '';
    /**
     * @type {boolean} hasDiseaseHistory
     * @description 是否有疾病史
     * @member {boolean}
     */
    this.hasDiseaseHistory = null;
    /**
     * @type {string} diseaseHistoryStr
     * @description 疾病史
     * @member {string}
     */
    this.diseaseHistoryStr = '';
    /**
     * @type {number[]} diseaseHistoryList
     * @description 疾病史列表
     * @member {number[]}
     */
    this.diseaseHistoryList = [];
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
     * @type {string} executionOfAOrg
     * @description A單位執行規劃
     * @member {string}
     */
    this.executionOfAOrg = '';
    /**
     * @type {string} noteOfAOrg
     * @description A單位備註
     * @member {string}
     */
    this.noteOfAOrg = '';
    /**
     * @type {AOrgServiceItemObject[]} serviceItemOfAOrg
     * @description A單位服務項目
     * @member {AOrgServiceItemObject[]}
     */
    this.serviceItemOfAOrg = [];
    /**
     * @type {CaseManagerInfoObject} caseManagerInfo
     * @description 個管員聯絡資訊
     * @member {CaseManagerInfoObject}
     */
    this.caseManagerInfo = new CaseManagerInfoObject();
    /**
     * @type {string} AA06Mark
     * @description 用來判斷AA06的註記
     * @member {string}
     */
    this.AA06Mark = '';
  }

  /**
   * 照顧計畫新舊資料比較
   * @param {Object} newData 新資料
   * @param {Object} oldData 舊資料
   * @returns {CarePlan}
   */
  compare(newData, oldData) {
    // different is true
    oldData.signOffSupervisor.forEach((v) => {
      v.date = moment(v.date).format('YYYY/MM/DD');
    });
    const spKey = ['bcPayment', 'gPayment', 'AA08Declared', 'AA09Declared', 'AA05EntitledDeclared', 'AA06EntitledDeclared', 'AA07EntitledDeclared'];
    for (const k of Object.keys(this)) {
      if (spKey.includes(k)) { continue; }
      this[k] = false;
      if ((k in newData) && (k in oldData)) {
        this[k] = !CustomValidator.isEqual(newData[k], oldData[k]);
      }
    }

    spKey.forEach((k1) => {
      for (const k2 of Object.keys(this[k1])) {
        const notExist = (!(k1 in newData) && !(k1 in oldData))
                        || (!(k2 in newData[k1]) && !(k2 in oldData[k1]));
        this[k1][k2] = notExist ? false : !CustomValidator.isEqual(newData[k1][k2], oldData[k1][k2]);
      }
    });

    oldData.serviceItems = oldData.serviceItems.map((v) => ({
      item: v.itemObject.serviceCode.split('_')[0],
      amount: v.amount,
      itemType: v.itemType,
    }));
    // notice:: add otherServiceItems to compare
    oldData.otherServiceItems.forEach((v) => {
      oldData.serviceItems.push({
        item: v.item,
        amount: v.amount,
        itemType: v.item.slice(0, 1),
      });
    });
    newData.serviceItems = _sortServiceItem(newData.serviceItems);
    oldData.serviceItems = _sortServiceItem(oldData.serviceItems);
    const itemKey = ['itemType', 'amount', 'item'];
    this.serviceItems = !newData.serviceItems.every((v, index) => itemKey.every((k) => CustomValidator.isEqual(v[k], oldData.serviceItems[index][k])));
    return this;
  }

  /**
   * 處理Html內容取得障礙類別
   * @param {Array|String} disabilityNote html資料
   * @returns {Array} 障礙類別
   */
  mapDisabilityCategories(disabilityNote) {
    if (CustomValidator.nonEmptyArray(this.newDisabilityCategories)) {
      return this.newDisabilityCategories;
    }
    const obj = [];
    if (Array.isArray(disabilityNote)) {
      disabilityNote.forEach((d) => {
        if (d.indexOf('ICF') != -1) {
          if (/\d+/.test(d)) {
            const icf = parseInt(d.match(/\d+/)[0], 10);
            if (icf <= 11) {
              obj.push(`${icf + 1}`);
            }
          }
        } else if (d) {
          const situation = getNumberBooleanKey(caseMap.newDisabilityCategoryMaps, /[)]\D+/.test(d) ? d.match(/[)]\D+/)[0].substr(1) : d, true);
          if (situation) {
            obj.push(situation);
          }
        }
      });
    } else {
      const situation = getNumberBooleanKey(caseMap.newDisabilityCategoryMaps, /[)]\D/.test(disabilityNote) ? disabilityNote.match(/[)]\D+/)[0].substr(1) : disabilityNote, true);
      if (situation) {
        obj.push(situation);
      }
    }
    return obj;
  }

  /**
   * 處理Html內容取得[外籍看護+特照津貼]
   * @param {String} data Html內容
   * @returns {Object} 外籍看護+特照津貼
   */
  mapForeignCareSPAllowance(data) {
    const exp = /:/g;
    const expMatches = [...data.matchAll(exp)];

    if (expMatches.length !== 2) {
      return { foreignCare: false, specialAllowance: false };
    }
    return {
      foreignCare: getNumberBooleanKey(caseMap.foreignCareSPAllowanceMaps, data[expMatches[0].index + 1]),
      specialAllowance: getNumberBooleanKey(caseMap.foreignCareSPAllowanceMaps, data[expMatches[1].index + 1]),
    };
  }

  /**
   * 整合[外籍看護+特照津貼]為一
   */
  combineForeignCareSPAllowance() {
    const { foreignCare, specialAllowance } = this.foreignCareSPAllowance;
    this.foreignCareSPAllowance = !(!foreignCare || !specialAllowance);
  }

  /**
   * 綁定照顧計畫預設服務
   * @param {Object} takeCarePlan html照顧計畫
   */
  bindDefaultServiceItem(takeCarePlan) {
    // 預設AA03, AA04, AA10
    takeCarePlan.bundledItem.push({
      item: 'AA03[照顧服務員配合專業服務]',
      price: 600,
      amount: 31,
      total: 0,
      itemType: 'A',
    });
    takeCarePlan.bundledItem.push({
      item: 'AA04[於臨終日提供服務加計]',
      price: 1200,
      amount: 1,
      total: 0,
      itemType: 'A',
    });
    takeCarePlan.bundledItem.push({
      item: 'AA10[夜間緊急服務]',
      price: 1000,
      amount: 31,
      total: 0,
      itemType: 'A',
    });
  }

  /**
   * 由Html綁定照顧計畫
   * @param {Object} data html資料
   * @returns {CarePlan}
   */
  bindHtml(data) {
    const { basicInfo, takeCarePlan } = data;
    this.bindDefaultServiceItem(takeCarePlan);
    takeCarePlan.bundledItem = _sortServiceItem(takeCarePlan.bundledItem);

    this.disabilityCategoryType = getNumberBooleanKey(caseMap.disabilityCategoryTypeMaps, basicInfo.disability.system);
    this.newDisabilityCategories = _mapList(caseMap.newDisabilityCategoryMaps, basicInfo.newBodySituation);
    this.oldDisabilityCategories = basicInfo.disability.oldBodySituation;
    this.oldDisabilityCategoriesList = _mapList(caseMap.oldDisabilityCategoryMaps, basicInfo.oldBodySituation);
    this.disabilityCategories = this.mapDisabilityCategories(basicInfo.disability.note);
    this.disability = getNumberBooleanKey(caseMap.disabilityLevelMaps, basicInfo.handicapLevel);
    this.isIntellectualDisability = getNumberBooleanKey(caseMap.isIntellectualDisabilityMaps, basicInfo.mentionHandicap);
    this.reliefType = getNumberBooleanKey(caseMap.reliefTypeMaps, basicInfo.customer.level);
    this.cmsLevel = getNumberBooleanKey(caseMap.cmsLevelMaps, takeCarePlan.CMSLevel);
    this.pricingType = getNumberBooleanKey(caseMap.pricingTypeMaps, takeCarePlan.bundled.priceType);
    this.foreignCareSPAllowance = this.mapForeignCareSPAllowance(takeCarePlan.bundled.workerCare);
    this.disabilityCertification = getNumberBooleanKey(caseMap.disabilityCertificationMaps, takeCarePlan.disabilityProve);
    this.declaredServiceCategory = _mapList(caseMap.declaredServiceCategoryMaps, basicInfo.customer.serviceItem);
    this.diseaseHistoryList = _mapList(caseMap.diseaseHistoryMaps, basicInfo.medicalHistoryList);
    this.icd = _mapList(caseMap.icdMaps, basicInfo.ICD);
    // this.serviceCategoryOfACM

    this.version = takeCarePlan.contractVersion;
    this.icdOthers = basicInfo.ICD_others;
    this.useBA12 = takeCarePlan.itemAA06IncludeBA12;
    this.introduction = takeCarePlan.introduction;
    this.subjectChangeSummary = takeCarePlan.changeSummary;
    this.changeReason = takeCarePlan.modifyReason;
    this.introductionOfAOrg = takeCarePlan.Aintroduction;
    this.disease = basicInfo.customer.disease || '';
    this.hasDiseaseHistory = basicInfo.hasMedicalHistory;
    this.diseaseHistoryStr = basicInfo.medicalHistory;
    this.behaviorAndEmotion = basicInfo.behavior;
    this.executionOfAOrg = takeCarePlan.AExecution;
    this.noteOfAOrg = takeCarePlan.AMemo;
    this.AA06Mark = basicInfo.specialMark;
    // this.note

    this.bcPayment = new PaymentObject().bindHtml(takeCarePlan.bundled);
    this.gPayment = new PaymentObject().bindHtml(takeCarePlan.bundledG);
    this.AA08Declared = new DeclaredObject().bindAA08(takeCarePlan.itemAA08);
    this.AA09Declared = new DeclaredObject().bindAA09(takeCarePlan.itemAA09);
    this.AA05EntitledDeclared = new EntitledDeclareObject().bindHtml(takeCarePlan.itemAA05);
    this.AA06EntitledDeclared = new EntitledDeclareObject().bindHtml(takeCarePlan.itemAA06);
    this.AA07EntitledDeclared = new EntitledDeclareObject().bindHtml(takeCarePlan.itemAA07);
    this.serviceItems = takeCarePlan.bundledItem.map((_value) => new RawServiceItem().bindHtml(_value));
    this.signOffSupervisor = takeCarePlan.signSupervisor.map((_value) => new SignOffSupervisorObject().bind(_value).toView());
    this.serviceItemOfAOrg = takeCarePlan.APlanItem.map((_value) => new AOrgServiceItemObject().bindHtml(_value));
    this.caseManagerInfo = new CaseManagerInfoObject().bindHtml(takeCarePlan.AContact);
    return this;
  }

  /**
   * 綁定照顧計畫
   * @param {Object} data 匯入建立資料
   * @returns {CarePlan}
   */
  bind(data) {
    super.bind(data, this);
    this.combineForeignCareSPAllowance();
    return this;
  }
}
class RawEvaluationData extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} question
     * @description 問題
     * @member {string}
     */
    this.question = '';
    /**
     * @type {string} answer
     * @description 答案
     * @member {string}
     */
    this.answer = '';
    /**
     * @type {string} score
     * @description 分數
     * @member {string}
     */
    this.score = null;
  }

  /**
   * 綁定Html ADLs資料
   * @param {Object} data html adl資料
   * @returns {RawEvaluationData}
   */
  bindADLs(data) {
    this.question = data.title;
    this.answer = data.val;
    this.score = data.score;
    return this;
  }

  /**
   * 綁定Html IADLs資料
   * @param {Object} data html iadl資料
   * @returns {RawEvaluationData}
   */
  bindIADLs(data) {
    this.question = data.title;
    this.answer = data.val;
    delete this.score;
    return this;
  }
}
class RawEvaluationObj extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {array} data
     * @description 評估資料
     * @member {array}
     */
    this.data = [];
  }

  /**
   * 綁定Html評估物件
   * @param {Array} _data 評估內容陣列
   * @param {String} type 評估類型
   * @returns {RawEvaluationObj}
   */
  bind(_data, type) {
    switch (type) {
      case 'ADLs':
        this.data = _data.map((_value) => new RawEvaluationData().bindADLs(_value));
        break;
      case 'IADLs':
        this.data = _data.map((_value) => new RawEvaluationData().bindIADLs(_value));
        break;
      default:
        break;
    }
    return this;
  }
}
class Evaluation extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {RawEvaluationObj} ADLs
     * @description ADL評估資料
     * @member {RawEvaluationObj}
     */
    this.ADLs = new RawEvaluationObj();
    /**
     * @type {RawEvaluationObj} IADLs
     * @description IADL評估資料
     * @member {RawEvaluationObj}
     */
    this.IADLs = new RawEvaluationObj();
    /**
     * @type {String} evaluateDate
     * @description 評估日期(填表日期)
     * @member {String}
     */
    this.evaluateDate = '';
  }

  /**
   * 由Html綁定評估資料
   * @param {Object} data html資料
   * @returns {Evaluation}
   */
  bindHtml(data) {
    const { basicInfo, evaluation } = data;
    this.ADLs = new RawEvaluationObj().bind(evaluation.ADLs, 'ADLs');
    this.IADLs = new RawEvaluationObj().bind(evaluation.IADLs, 'IADLs');
    this.evaluateDate = basicInfo.handleTime;
    return this;
  }

  /**
   * 綁定評估資料
   * @param {Object} data 匯入建立資料
   * @returns {Evaluation}
   */
  bind(data) {
    super.bind(data, this);
    return this;
  }
}

class CasePlanHtmlObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} tempFile
     * @description 暫存檔名
     * @member {string}
     */
    this.tempFile = '';
    /**
     * @type {object} basicInfo
     * @description 基本資料
     * @member {object}
     */
    this.basicInfo = new BasicInfo();
    /**
     * @type {object} carePlan
     * @description 照顧計畫
     * @member {object}
     */
    this.carePlan = new CarePlan();
    /**
     * @type {object} evaluation
     * @description 個案評估
     * @member {object}
     */
    this.evaluation = new Evaluation();
  }

  /**
   * 綁定[照顧管理評估量表與照顧計畫]檔案路徑
   * @param {String} data [照顧管理評估量表與照顧計畫]檔案路徑
   * @returns {CasePlanHtmlObject}
   */
  withTempFile(data) {
    this.tempFile = data;
    return this;
  }

  /**
   * 綁定Html[照顧管理評估量表與照顧計畫]內容
   * @param {Object} data html資料
   * @returns {CasePlanHtmlObject}
   */
  bindHtml(data) {
    this.basicInfo = new BasicInfo().bindHtml(data);
    this.carePlan = new CarePlan().bindHtml(data);
    this.evaluation = new Evaluation().bindHtml(data);
    return this;
  }

  /**
   * 綁定[照顧管理評估量表與照顧計畫]
   * @param {Object} data 匯入照顧計畫內容
   * @returns {CasePlanHtmlObject}
   */
  bind(data) {
    super.bind(data, this);
    this.basicInfo = new BasicInfo().bind(data.basicInfo);
    this.carePlan = new CarePlan().bind(data.carePlan);
    this.evaluation = new Evaluation().bind(data.evaluation);
    return this;
  }
}

module.exports = {
  CasePlanHtmlObject,
  BasicInfo,
  CarePlan,
  RawRelationshipPerson,
  RawCaregiver,
};
