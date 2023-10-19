/**
 * FeaturePath: Common-Entity--照顧計畫
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: care-plan-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-06-06 05:00:59 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const moment = require('moment');
const { CustomUtils, CustomValidator } = require('@erpv3/app-common/custom-tools');
const BaseEntity = require('./base-entity');
const PaymentObject = require('../value-objects/payment-object');
const EntitledDeclareObject = require('../value-objects/entitled-declare-object');
const DeclaredObject = require('../value-objects/declared-object');
const CaseManagerInfoObject = require('../value-objects/case-manager-info-object');
const SupportServiceItemObject = require('../value-objects/support-service-item-object');

/**
* @class
* @classdesc CarePlanEntity
*/
class CarePlanEntity extends BaseEntity {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} caseId
     * @description 個案Id
     * @member {string}
     */
    this.caseId = '';
    /**
     * @type {string} version
     * @description 照顧計畫在仁寶平台版本
     * @member {string}
     */
    this.version = '';
    /**
     * @type {boolean} isHtml
     * @description 是否為Html匯入/更新
     * @member {boolean}
     */
    this.isHtml = false;
    /**
     * @type {number} planType
     * @description 計畫類型
     * @member {number}
     */
    this.planType = null;
    /**
     * @type {date} consultingDate
     * @description 照會日期
     * @member {date}
     */
    this.consultingDate = null;
    /**
     * @type {date} acceptConsultingDate
     * @description 接受照會日期
     * @member {date}
     */
    this.acceptConsultingDate = null;
    /**
     * @type {date} visitingDate
     * @description 訪視日期
     * @member {date}
     */
    this.visitingDate = null;
    /**
     * @type {date} firstServiceDate
     * @description 初次服務日期
     * @member {date}
     */
    this.firstServiceDate = null;
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
     * @type {number} disabilityCategoryType
     * @description 身障類別制度(新/舊)
     * @member {number}
     */
    this.disabilityCategoryType = null;
    /**
     * @type {array} newDisabilityCategories
     * @description 身障類別(新)
     * @member {array}
     */
    this.newDisabilityCategories = [];
    /**
     * @type {string} oldDisabilityCategories
     * @description 身障類別(舊)
     * @member {string}
     */
    this.oldDisabilityCategories = '';
    /**
     * @type {array} oldDisabilityCategoriesList
     * @description 身障類別(舊列表)
     * @member {array}
     */
    this.oldDisabilityCategoriesList = [];
    /**
     * @type {array} disabilityCategories
     * @description 障礙類別(身障類別-新||ICF資料介接)
     * @member {array}
     */
    this.disabilityCategories = [];
    /**
     * @type {boolean} disabilityCertification
     * @description 身心障礙失智症手冊
     * @member {boolean}
     */
    this.disabilityCertification = false;
    /**
     * @type {array} icd
     * @description ICD診斷
     * @member {array}
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
     * @type {number} disabilityItem
     * @description 身障項目別
     * @member {number}
     */
    this.disabilityItem = null;
    /**
     * @type {boolean} isIntellectualDisability
     * @description 是否符合心智障礙
     * @member {boolean}
     */
    this.isIntellectualDisability = false;
    /**
     * @type {boolean} isAA11a
     * @description 是否需要身心障礙專業訓練服務員
     * @member {boolean}
     */
    this.isAA11a = false;
    /**
     * @type {boolean} isAA11b
     * @description 是否需要失智症專業訓練服務員
     * @member {boolean}
     */
    this.isAA11b = false;
    /**
     * @type {boolean} isAA11aRemind
     * @description 是否"提醒"需要身心障礙專業訓練服務員
     * @member {boolean}
     */
    this.isAA11aRemind = false;
    /**
     * @type {number} pricingType
     * @description 計價類別
     * @member {number}
     */
    this.pricingType = null;
    /**
     * @type {boolean} foreignCareSPAllowance
     * @description 請外勞照護或領有特照津貼
     * @member {boolean}
     */
    this.foreignCareSPAllowance = false;
    /**
     * @type {date} planStartDate
     * @description 照顧計畫起始日期
     * @member {date}
     */
    this.planStartDate = null;
    /**
     * @type {date} planEndDate
     * @description 照顧計畫結束日期
     * @member {date}
     */
    this.planEndDate = null;
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
     * @type {array} declaredServiceCategory
     * @description 申請服務種類
     * @member {array}
     */
    this.declaredServiceCategory = [];
    /**
     * @type {array} serviceCategoryOfACM
     * @description A個管申請服務種類
     * @member {array}
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
    this.hasDiseaseHistory = false;
    /**
     * @type {string} diseaseHistoryStr
     * @description 疾病史
     * @member {string}
     */
    this.diseaseHistoryStr = '';
    /**
     * @type {array} diseaseHistoryList
     * @description 疾病史列表
     * @member {array}
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
     * @type {PaymentObject} sPayment
     * @description 短照服務(S碼)
     * @member {PaymentObject}
     */
    this.sPayment = new PaymentObject();
    /**
     * @type {boolean} needHelpGoingUpAndDown
     * @description AA06: 是否上下樓需要幫忙
     * @member {boolean}
     */
    this.needHelpGoingUpAndDown = false;
    /**
     * @type {boolean} hasDrainageTubeOrScald
     * @description AA06: 是否有傷燙傷等管理
     * @member {boolean}
     */
    this.hasDrainageTubeOrScald = false;
    /**
     * @type {number} adlTransferType
     * @description AA06: 移位困難
     * @member {number}
     */
    this.adlTransferType = null;
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
    this.useBA12 = false;
    /**
     * @type {array<SupportServiceItemObject>} serviceItems
     * @description 支援服務項目
     * @member {array<SupportServiceItemObject>}
     */
    this.serviceItems = [];
    /**
     * @type {array<OtherServiceItemObject>} otherServiceItems
     * @description 其他(未支援)服務項目
     * @member {array<OtherServiceItemObject>}
     */
    this.otherServiceItems = [];
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
     * @type {array<AOrgServiceItemObject>} serviceItemOfAOrg
     * @description Ａ單位: 服務項目
     * @member {array<AOrgServiceItemObject>}
     */
    this.serviceItemOfAOrg = [];
    /**
     * @type {array<ObjectId>} OPTDecisionRefIds
     * @description 最優判定計畫所參照的一般照護計畫IDs
     * @member {array<ObjectId>}
     */
    this.OPTDecisionRefIds = [];
    /**
     * @type {boolean} isOPTDecisionRefCase
     * @description 最優判定計畫是否參照個案內容
     * @member {boolean}
     */
    this.isOPTDecisionRefCase = false;
    /**
     * @type {caseManagerInfo} caseManagerInfo
     * @description 個管員聯絡資訊
     * @member {caseManagerInfo}
     */
    this.caseManagerInfo = new CaseManagerInfoObject();
    /**
     * @type {array<SignOffSupervisorObject>} signOffSupervisor
     * @description 簽審督導
     * @member {array<SignOffSupervisorObject>}
     */
    this.signOffSupervisor = [];
  }

  bind(data) {
    super.bind(data, this);
    this.serviceItems.forEach((value, index) => {
      this.serviceItems[index] = new SupportServiceItemObject().bind(value);
    });
    return this;
  }

  bindDBObjectId(data) {
    super.bind(data, this);
    this.caseId = data.caseId.toString();

    if (CustomValidator.nonEmptyArray(data.serviceItems)) {
      // data is populate
      this.serviceItems = data.serviceItems.map((value) => {
        const _obj = {
          itemType: value.itemType,
          amount: value.amount,
        };
        if (value.itemId._id) {
          const _item = CustomUtils.deepCopy(value.itemId);
          _obj.itemId = _item._id.toString();
          _obj.itemObject = _item;
        } else {
          _obj.itemId = value.itemId;
        }
        return _obj;
      });
    }
    return this;
  }

  bindCreate(data) {
    this.isHtml = data.isHtml;
    this.planStartDate = data.planStartDate;
    this.consultingDate = data.consultingDate;
    this.acceptConsultingDate = data.acceptConsultingDate;
    this.visitingDate = data.visitingDate;
    this.firstServiceDate = data.firstServiceDate;
    this.cmsLevel = data.cmsLevel;
    this.reliefType = data.reliefType;
    this.pricingType = data.pricingType;
    this.foreignCareSPAllowance = data.foreignCareSPAllowance;
    this.bcPayment = data.bcPayment;
    this.gPayment = data.gPayment;
    this.AA08Declared = data.AA08Declared;
    this.AA09Declared = data.AA09Declared;
    this.useBA12 = data.useBA12;
    this.serviceItems = data.serviceItems;
    this.note = data.note;
    return this;
  }

  withCaseId(caseId = '') {
    this.caseId = caseId;
    return this;
  }

  toView() {
    const dateFormat = 'YYYY/MM/DD';
    const obj = {
      id: this.id,
      isHtml: this.isHtml,
      planStartDate: this.planStartDate ? moment(this.planStartDate).format(dateFormat) : '',
      planEndDate: this.planEndDate ? moment(this.planEndDate).format(dateFormat) : '',
      consultingDate: this.consultingDate ? moment(this.consultingDate).format(dateFormat) : '',
      acceptConsultingDate: this.acceptConsultingDate ? moment(this.acceptConsultingDate).format(dateFormat) : '',
      visitingDate: this.visitingDate ? moment(this.visitingDate).format(dateFormat) : '',
      firstServiceDate: this.firstServiceDate ? moment(this.firstServiceDate).format(dateFormat) : '',
      cmsLevel: this.cmsLevel,
      reliefType: this.reliefType,
      pricingType: this.pricingType,
      foreignCareSPAllowance: this.foreignCareSPAllowance,
      bcPayment: {
        quota: this.bcPayment.quota,
        excessOwnExpense: this.bcPayment.excessOwnExpense,
      },
      gPayment: {
        quota: this.gPayment.quota,
      },
      AA05EntitledDeclared: this.AA05EntitledDeclared,
      AA06EntitledDeclared: this.AA06EntitledDeclared,
      AA07EntitledDeclared: this.AA07EntitledDeclared,
      AA08Declared: {
        B: this.AA08Declared.B,
        C: this.AA08Declared.C,
      },
      AA09Declared: {
        B: this.AA09Declared.B,
        C: this.AA09Declared.C,
        G: this.AA09Declared.G,
      },
      useBA12: this.useBA12,
      note: this.note,
      vn: this.__vn,
    };

    obj.signOffSupervisor = this.signOffSupervisor.map((data) => ({
      name: data.name,
      status: data.status,
      date: data.date ? moment(data.date).format(dateFormat) : '',
    }));

    obj.serviceItems = this.serviceItems.map((data) => ({
      itemId: data.itemId,
      serviceCode: data.itemObject.serviceCode,
      serviceName: data.itemObject.serviceName,
      itemType: data.itemType,
      amount: data.amount,
    }));

    obj.otherServiceItems = this.otherServiceItems.map((data) => ({
      item: data.item,
      amount: data.amount,
    }));

    return obj;
  }
}

module.exports = CarePlanEntity;
