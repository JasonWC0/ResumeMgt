/**
 * FeaturePath: Common-Model--個案
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { SchemaTypes, Schema } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const {
  modelCodes,
  caseSourceCodes,
  reliefTypeCodes,
  livingArrangementCodes,
  caseLivingWithCodes,
  caseServiceStatusCodes,
  casePipelineServiceCodes,
  caseRcServiceItemCodes,
  billPlaceTypeCodes,
  customWelfareTypeCodes,
  customPaymentMethodCodes,
  customAdditionalSourceCodes,
} = require('../../domain');
const { PlaceSchema } = require('./common-schema');

const _baseServiceSchema = new Schema({
  _id: false,
  // 案號
  caseNumber: {
    type: String,
  },
  // 身高
  height: {
    type: Number,
  },
  // 體重
  weight: {
    type: Number,
  },
  // 小腿圍
  calfGirth: {
    type: Number,
  },
  // 個案分類
  category: {
    type: String,
  },
  // 個案來源
  source: {
    type: Number,
    enum: Object.values(caseSourceCodes),
  },
  // 福利身分別
  reliefType: {
    type: Number,
    enum: Object.values(reliefTypeCodes),
  },
  // 居住狀況
  livingArrangement: {
    type: Number,
    enum: Object.values(livingArrangementCodes),
  },
  // 病歷號碼
  medicalRecordNumber: {
    type: String,
  },
  // 同步生理數據
  syncVitalSignToDM: {
    type: Boolean,
  },
  // 同住人員
  livingWith: [{
    type: Number,
    enum: Object.values(caseLivingWithCodes),
  }],
  // 服務開始日期
  startDate: {
    type: Date,
  },
  // 服務結束日期
  endDate: {
    type: Date,
  },
  // 帳單地址類型
  billPlaceType: {
    type: Number,
    enum: Object.values(billPlaceTypeCodes),
  },
  // 帳單地址
  billPlace: {
    type: PlaceSchema,
  },
  // 帳單備註
  billNote: {
    type: String,
    trim: true,
  },
  // 個案狀態
  status: {
    type: Number,
    enum: Object.values(caseServiceStatusCodes),
  },
  // 資料是否有效
  valid: {
    type: Boolean,
    default: true,
  },
  // 案號(程式產生)
  code: {
    type: String,
    trim: true,
  },
  // 開案日期
  openDate: {
    type: Date,
  },
  // 補助額度%
  approvedRatio: {
    type: Number,
  },
  // 10711新支付
  service10711Flag: {
    type: Boolean,
  },
  // 收托前評估人Id (日照)
  evaluateCaseId: {
    type: SchemaTypes.ObjectId,
  },
  // 衛福代碼
  MOHWCode: {
    type: String,
  }
});

const _schema = new BaseSchema(
  {
    // 登入者personId
    personId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.PERSON}`,
    },
    // companyId
    companyId: {
      type: SchemaTypes.ObjectId,
    },
    // 銀行繳費明細表-流水號(宜蘭康活客製)
    bankBillSerialNumber: {
      type: Number,
    },
    // 居家服務
    hc: {
      type: _baseServiceSchema.add({
        // 主責居服員
        masterHomeservicerId: {
          type: SchemaTypes.ObjectId,
        },
        // 主督導員
        supervisorId: {
          type: SchemaTypes.ObjectId,
        },
        // 副督導員
        subSupervisorId: {
          type: SchemaTypes.ObjectId,
        },
        // 和機構的距離
        companyDistance: {
          type: Number,
        },
        // 服務地址 - 經緯度是否手動輸入
        residencePlacebyCoordinate: {
          type: Boolean,
        },
        // 自訂服務項目時間
        serviceTimeRequired: {
          type: Object,
        },
        // 福利別(機構客製)
        welfareType: {
          type: Number,
          enum: Object.values(customWelfareTypeCodes),
        },
        // 繳款方式(宜蘭康活、宜蘭舒活客製功能)
        paymentMethod: {
          type: Number,
          enum: Object.values(customPaymentMethodCodes),
        },
        // 來源 (天晟醫院金色年代客製)
        additionalSource: {
          type: Number,
          enum: Object.values(customAdditionalSourceCodes),
        },
        // 自訂服務項目時間，資料格式如下：
        // serviceItemSuggestSetting: {
        //   GA09_1: {
        //     personTime: { type: Number },
        //     fixedTime: { type: Number },
        //     note: { type: String },
        //   }, ...
        // }
        serviceItemSuggestSetting: {
          type: Object,
        },
      }),
      default: null,
    },
    // 社區式服務
    dc: {
      type: _baseServiceSchema.add({
        // 照服員
        careAttendantId: {
          type: SchemaTypes.ObjectId,
        },
        // 據點名稱
        locationName: {
          type: String,
        },
        // 司機(去程)
        outboundDriverId: {
          type: SchemaTypes.ObjectId,
        },
        // 司機(回程)
        inboundDriverId: {
          type: SchemaTypes.ObjectId,
        },
        // 交通車超額自費項目(去程)
        outboundShuttleOwnExpenseItem: {
          type: String,
        },
        // 交通車超額自費項目(回程)
        inboundShuttleOwnExpenseItem: {
          type: String,
        },
        // 個案接送順序優先權 (for 日照交通車)
        driverPriority: {
          type: Number,
        },
      }),
      default: null,
    },
    // 住宿式服務
    rc: {
      type: _baseServiceSchema.add({
        // 管路服務
        pipelineService: [{
          type: Number,
          enum: Object.values(casePipelineServiceCodes),
        }],
        // 服務項目
        rcServiceItem: {
          type: Number,
          enum: Object.values(caseRcServiceItemCodes),
        },
        // 預計服務開始日期
        scheduledStartDate: {
          type: Date,
        },
        // 預計服務結束日期
        scheduledEndDate: {
          type: Date,
        },
        // 房型
        roomType: {
          type: String,
        },
        // 床號
        roomNo: {
          type: String,
        },
        // 房號
        bedNo: {
          type: String,
        },
        // 是否已評估
        evaluated: {
          type: Boolean,
        },
        // 入住歷史紀錄
        historyRecord: [{
          // 服務開始日期
          startDate: {
            type: Date,
          },
          // 服務結束日期
          endDate: {
            type: Date,
          },
          // 預計服務開始日期
          scheduledStartDate: {
            type: Date,
          },
          // 預計服務結束日期
          scheduledEndDate: {
            type: Date,
          },
          // 房型
          roomType: {
            type: String,
          },
          // 床號
          roomNo: {
            type: String,
          },
          // 房號
          bedNo: {
            type: String,
          },
        }],
      }),
      default: null,
    },
    // A個管
    acm: {
      type: new Schema(_baseServiceSchema).add({
        // 匯入日期
        importDate: {
          type: Date,
        },
        // 主責個管員ID
        caseManagerId: {
          type: SchemaTypes.ObjectId,
        },
        // 副個管員ID
        subCaseManagerId: {
          type: SchemaTypes.ObjectId,
        },
        // 照管員ID
        careManagerId: {
          type: SchemaTypes.ObjectId,
        },
      }).remove([
        'startDate',
        'billPlace',
        'code',
        'openDate',
        'approvedRatio',
        'service10711Flag',
        'evaluateCaseId',
      ]),
      default: null,
    },
    // gh
    gh: {
      type: new Schema({}),
      default: null,
    },
    valid: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.CASE}s`,
  }
);

_schema.index({ companyId: 1, personId: 1 });

module.exports = {
  modelName: modelCodes.CASE,
  schema: _schema,
};
