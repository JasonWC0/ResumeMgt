/**
 * FeaturePath: Common-Model--服務項目
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const {
  modelCodes,
} = require('../../domain');

const _schema = new BaseSchema(
  {
    // 項目編號
    serviceCode: {
      type: String,
      trim: true,
      require: true,
    },
    // 照顧組合
    serviceName: {
      type: String,
      trim: true,
    },
    // 互斥項目
    serviceExclude: {
      type: String,
      trim: true,
    },
    // 依賴項目
    serviceRely: {
      type: String,
      trim: true,
    },
    // 所需時間
    time: {
      type: Number,
    },
    // 執行幾次為一單位
    unit: {
      type: Number,
    },
    // 居服員俱備條件
    servicerCert: {
      type: String,
    },
    // 費用
    cost: {
      type: Number,
    },
    // 離島費用
    aboriginalCost: {
      type: Number,
    },
    // 適用cms等級
    cms: {
      type: Number,
    },
    // 分類[ HC, DC, RC, ACM, GH ]
    serviceCategory: {
      type: String,
    },
    // 服務時間預設值[支付計算機用]
    timeRequired: {
      type: Number,
    },
    // 假日提供照顧
    dayoff: {
      type: Boolean,
      default: false,
    },
    // 加計單位
    periodUnit: {
      type: String,
      trim: true,
    },
    // 服務時間範圍
    servicePeriod: {
      type: String,
    },
    // 系統自動判斷
    systemAuto: {
      type: String,
      trim: true,
    },
    // 最低適用CMS等級
    cmsLimit: {
      type: Number,
    },
    // 縣市
    city: {
      type: String,
      trim: true,
    },
    // 選項
    serviceOption: [{
      _id: false,
      seq: String,
      description: String,
      method: {
        type: String,
        default: '',
      },
      methodDesc: {
        type: String,
        default: '',
      },
      itemExclude: {
        type: String,
        default: '',
      },
      itemRely: {
        type: String,
        default: '',
      },
      itemTime: {
        type: Number,
        default: null,
      },
      shortDesc: {
        type: String,
        default: '',
      },
      // 服務時間預設值[排班用]
      timeRequired: {
        type: Number,
        default: null,
      },
    }],
    // 自訂項目: 是否為預設項目
    customDefault: {
      type: Boolean,
      default: false,
    },
    // 民眾單價(低收)
    lowPay: {
      type: Number,
    },
    // 民眾單價(中低收)
    middlePay: {
      type: Number,
    },
    // 民眾單價(一般戶)
    normalPay: {
      type: Number,
    },
    // 項目版本(配合10711新制), 1:10701的制度 , 2:10711的新制
    serviceVersion: [{
      type: Number,
    }],
    // 固定時間(項目需做滿該時數，方能在紀錄計算為1次)
    fixedTimeFlag: Boolean,
    // 公司Id, 若為null則為政府項目
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
      default: null,
    },
    // 拆站前公司Id
    departFrom: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
    },
    // 此服務項目支援的屏東中央服務紀錄客製化類型
    supportPingtungReport: [
      Number
    ],
    // 報表顯示名稱
    reportName: String,
    // 合併加計項目
    serviceCombine: [{
      type: String,
    }],
    // 是否需要具備相關訓練與證照
    trainingRequired: {
      type: Boolean,
      default: false,
    },
    // 建立人
    creator: {
      type: SchemaTypes.ObjectId,
    },
    // 編輯人
    modifier: {
      type: SchemaTypes.ObjectId,
    },
    // 刪除人
    deleter: {
      type: SchemaTypes.ObjectId,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.SERVICEITEM}s`,
  }
);

_schema.index({ serviceCode: 1, companyId: 1 }, { unique: true });

module.exports = {
  modelName: modelCodes.SERVICEITEM,
  schema: _schema,
};
