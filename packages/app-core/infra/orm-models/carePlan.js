/**
 * FeaturePath: Common-Model--照顧計畫
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: carePlan.js
 * Project: @erpv3/app-core
 * File Created: 2022-06-06 01:43:45 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const {
  modelCodes, planTypeCodes, reliefTypeCodes,
  cmsLevelCodes, disabilityCategoryTypeCodes, newDisabilityCategoryCodes,
  disabilityLevelCodes, disabilityItemCodes, pricingTypeCodes,
  planServiceCategoryCodes, planServiceCategoryACMCodes, diseaseHistoryCodes,
  icdCodes, oldDisabilityCategoryCodes, adlTransferTypeCodes
} = require('../../domain');

const _schema = new BaseSchema(
  {
    // 個案Id
    caseId: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: `${modelCodes.CASE}`,
    },
    // 照顧計畫在仁寶平台版本
    version: {
      type: String,
      trim: true,
    },
    // 是否為Html匯入/更新
    isHtml: {
      type: Boolean,
      required: false,
    },
    // 計畫類型
    planType: {
      type: Number,
      enum: Object.values(planTypeCodes),
      default: planTypeCodes.normal,
    },
    // 照會日期
    consultingDate: {
      type: Date,
    },
    // 接受照會日期
    acceptConsultingDate: {
      type: Date,
    },
    // 訪視日期
    visitingDate: {
      type: Date,
    },
    // 初次服務日期
    firstServiceDate: {
      type: Date,
    },
    // 福利身份別
    reliefType: {
      type: Number,
      enum: Object.values(reliefTypeCodes),
    },
    // CMS等級
    cmsLevel: {
      type: Number,
      enum: Object.values(cmsLevelCodes),
    },
    // 身障類別制度(新/舊) [A3a1]
    disabilityCategoryType: {
      type: Number,
      enum: Object.values(disabilityCategoryTypeCodes),
    },
    // 身障類別(新) [A3a2]
    newDisabilityCategories: [{
      type: Number,
      enum: Object.values(newDisabilityCategoryCodes),
    }],
    // 身障類別(舊): FE顯示此欄位
    oldDisabilityCategories: {
      type: String,
      trim: true,
    },
    // 身障類別(舊列表): FE無顯示，用於判斷aa11 [A3a3]
    oldDisabilityCategoriesList: [{
      type: Number,
      enum: Object.values(oldDisabilityCategoryCodes),
    }],
    // 障礙類別(身障類別-新||ICF資料介接)
    disabilityCategories: [{
      type: Number,
      enum: Object.values(newDisabilityCategoryCodes),
    }],
    // 身心障礙失智症手冊
    disabilityCertification: {
      type: Boolean,
    },
    // ICD診斷 [A3a2]
    icd: [{
      type: Number,
      enum: Object.values(icdCodes),
    }],
    // ICD其他診斷 [A3a2]
    icdOthers: {
      type: String,
      trim: true,
    },
    // 障礙等級 [A3a4]
    disability: {
      type: Number,
      enum: Object.values(disabilityLevelCodes),
    },
    // 身障項目別
    disabilityItem: {
      type: Number,
      enum: Object.values(disabilityItemCodes),
    },
    // 是否符合心智障礙
    isIntellectualDisability: {
      type: Boolean,
      default: false,
    },
    // 是否需要身心障礙專業訓練服務員
    isAA11a: {
      type: Boolean,
      default: false,
    },
    // 是否需要失智症專業訓練服務員
    isAA11b: {
      type: Boolean,
      default: false,
    },
    // 是否"提醒"需要身心障礙專業訓練服務員
    isAA11aRemind: {
      type: Boolean,
      default: false,
    },
    // 計價類別
    pricingType: {
      type: Number,
      enum: Object.values(pricingTypeCodes),
    },
    // 請外勞照護或領有特照津貼
    foreignCareSPAllowance: {
      type: Boolean,
      default: false,
    },
    // 照顧計畫起始日期
    planStartDate: {
      type: Date,
      required: true,
    },
    // 照顧計畫結束日期
    planEndDate: {
      type: Date,
      default: null,
    },
    // 簡述計畫
    introduction: {
      type: String,
      trim: true,
    },
    // 主旨、異動摘要
    subjectChangeSummary: {
      type: String,
      trim: true,
    },
    // 異動原因
    changeReason: {
      type: String,
      trim: true,
    },
    // 申請服務種類
    declaredServiceCategory: [{
      type: Number,
      enum: Object.values(planServiceCategoryCodes),
    }],
    // A個管申請服務種類
    serviceCategoryOfACM: [{
      type: Number,
      enum: Object.values(planServiceCategoryACMCodes),
    }],
    // 罹患疾病
    disease: {
      type: String,
      trim: true,
    },
    // 是否有疾病史 [G4e]
    hasDiseaseHistory: {
      type: Boolean,
      default: false,
    },
    // 疾病史
    diseaseHistoryStr: {
      type: String,
      trim: true,
    },
    // 疾病史列表 [G4e]
    diseaseHistoryList: [{
      type: Number,
      enum: Object.values(diseaseHistoryCodes),
    }],
    // 行為與情緒
    behaviorAndEmotion: {
      type: String,
      trim: true,
    },
    // 備註
    note: {
      type: String,
      trim: true,
    },
    // 照顧及專業服務(BC碼)
    bcPayment: {
      // 給付額度(元)
      quota: {
        type: Number,
      },
      // 補助金額(元)
      subsidy: {
        type: Number,
      },
      // 民眾部份負擔(元)
      copayment: {
        type: Number,
      },
      // 超額自費(元)
      excessOwnExpense: {
        type: Number,
      },
    },
    // 喘息服務(G碼)
    gPayment: {
      // 給付額度(元)
      quota: {
        type: Number,
      },
      // 補助金額(元)
      subsidy: {
        type: Number,
      },
      // 民眾部份負擔(元)
      copayment: {
        type: Number,
      },
    },
    // 短照服務(S)
    sPayment: {
      // 給付額度(元)
      quota: {
        type: Number,
      },
      // 補助金額(元)
      subsidy: {
        type: Number,
      },
      // 民眾部分負擔(元)
      copayment: {
        type: Number,
      },
    },
    // AA06: 是否上下樓需要幫忙
    needHelpGoingUpAndDown: {
      type: Boolean,
    },
    // AA06: 是否有傷燙傷等管理
    hasDrainageTubeOrScald: {
      type: Boolean,
    },
    // AA06: 移位困難
    adlTransferType: {
      type: Number,
      enum: Object.values(adlTransferTypeCodes),
    },
    // AA05申報資格
    AA05EntitledDeclared: {
      // 是否適用核銷年月107-12後
      isWriteOffAfter10712: {
        type: Boolean,
        default: false,
      },
      // 是否適用核銷年月107-09至107-11之間
      isWriteOffBetween10709And10711: {
        type: Boolean,
        default: false,
      },
    },
    // AA06申報資格
    AA06EntitledDeclared: {
      // 是否適用核銷年月107-12後
      isWriteOffAfter10712: {
        type: Boolean,
        default: false,
      },
      // 是否適用核銷年月107-09至107-11之間
      isWriteOffBetween10709And10711: {
        type: Boolean,
        default: false,
      },
    },
    // AA07申報資格
    AA07EntitledDeclared: {
      // 是否適用核銷年月107-12後
      isWriteOffAfter10712: {
        type: Boolean,
        default: false,
      },
      // 是否適用核銷年月107-09至107-11之間
      isWriteOffBetween10709And10711: {
        type: Boolean,
        default: false,
      },
    },
    // AA08申報
    AA08Declared: {
      // 申報B碼
      B: {
        type: Boolean,
        default: false,
      },
      // 申報C碼
      C: {
        type: Boolean,
        default: false,
      },
    },
    // AA09申報
    AA09Declared: {
      // 申報B碼
      B: {
        type: Boolean,
        default: false,
      },
      // 申報C碼
      C: {
        type: Boolean,
        default: false,
      },
      // 申報G碼
      G: {
        type: Boolean,
        default: false,
      },
    },
    // 使用BA12
    useBA12: {
      type: Boolean,
      default: false,
    },
    // 支援服務項目
    serviceItems: [{
      _id: false,
      // 服務項目Id
      itemId: {
        type: SchemaTypes.ObjectId,
        ref: `${modelCodes.SERVICEITEM}`,
      },
      // 服務項目類別, ex: A,B,C,D,G
      itemType: {
        type: String,
        trim: true,
      },
      // 服務數量
      amount: {
        type: Number,
      },
    }],
    // 其他(未支援)服務項目
    otherServiceItems: [{
      _id: false,
      // 服務項目內容
      item: {
        type: String,
        trim: true,
      },
      // 服務數量
      amount: {
        type: Number,
      },
      // 金額
      cost: {
        type: Number,
      },
      // 總額(小計)
      total: {
        type: Number,
      },
    }],
    // Ａ單位: 計畫目標
    introductionOfAOrg: {
      type: String,
      trim: true,
    },
    // Ａ單位: 執行規劃
    executionOfAOrg: {
      type: String,
      trim: true,
    },
    // A單位: 備註
    noteOfAOrg: {
      type: String,
      trim: true,
    },
    // Ａ單位: 服務項目
    serviceItemOfAOrg: [{
      _id: false,
      // 照顧清單(服務項目之細項)
      item: {
        type: String,
        trim: true,
      },
      // 照專姓名
      careManagerName: {
        type: String,
        trim: true,
      },
      // A單位名稱
      aOrgName: {
        type: String,
        trim: true,
      },
      // 擬定之原因說明
      reason: {
        type: String,
        trim: true,
      },
    }],
    // 最優判定計畫所參照的一般照護計畫IDs
    OPTDecisionRefIds: [{
      type: SchemaTypes.ObjectId,
    }],
    // 最優判定計畫是否參照個案內容
    isOPTDecisionRefCase: {
      type: Boolean,
      default: false,
    },
    // 用來判斷AA06的註記
    AA06Mark: {
      type: String,
      trim: true,
    },
    // 個管員聯絡資訊
    caseManagerInfo: {
      // 姓名
      name: {
        type: String,
        trim: true,
      },
      // 聯絡電話
      phone: {
        type: String,
        trim: true,
      },
      // email
      email: {
        type: String,
        trim: true,
      },
      // 單位名稱
      org: {
        type: String,
        trim: true,
      },
    },
    // 簽審督導
    signOffSupervisor: [{
      _id: false,
      // 簽審督導姓名
      name: {
        type: String,
        trim: true,
      },
      // 簽審狀態
      status: {
        type: String,
        trim: true,
      },
      // 簽審日期
      date: {
        type: Date,
      },
    }],
    // 照顧計畫檔案
    carePlanFile: {
      // 儲存服務的id
      id: {
        type: String,
        trim: true,
      },
      // 儲存服務的 public url
      publicUrl: {
        type: String,
        trim: true,
      },
      // 更新時間
      updatedAt: {
        type: Date,
      },
      // MIME類型
      mimeType: {
        type: String,
        trim: true,
      },
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.CAREPLAN}s`,
  }
);

_schema.index({
  caseId: 1, valid: 1, planType: 1, planEndDate: 1,
});

module.exports = {
  modelName: modelCodes.CAREPLAN,
  schema: _schema,
};
