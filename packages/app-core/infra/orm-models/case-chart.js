/**
 * FeaturePath: Common-Model--個案圖資
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes, caseChartCategoryCodes } = require('../../domain');
const { FileSchema } = require('./common-schema');

const _schema = new BaseSchema(
  {
    // 個案id
    caseId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.CASE}s`,
    },
    // 公司id
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}s`,
    },
    // 圖表種類
    category: {
      type: Number,
      enum: Object.values(caseChartCategoryCodes),
    },
    // 圖檔
    chart: {
      type: FileSchema,
    },
    // 填寫人
    maker: {
      type: String,
      trim: true,
    },
    // 填寫日期
    makeDate: {
      type: String,
    },
    // 引入家系圖檔案
    relationChart: {
      type: FileSchema,
    },
    // 圖表結構
    structureChart: [{
      _id: false,
      // 圖形序號
      id: {
        type: Number,
        trim: true,
      },
      // 姓名或機構
      name: {
        type: String,
        trim: true,
      },
      // 與個案連結
      connected: {
        type: Boolean,
      },
      // 資源互動方向
      direction: {
        type: String,
        trim: true,
      },
      // 衝突、壓力關係
      conflict: {
        type: Boolean,
      },
      // 其他
      other: {
        type: String,
        trim: true,
      },
      // 個案性別
      gender: {
        type: String,
        trim: true,
      },
      // 個案健康狀態
      status: {
        type: String,
        trim: true,
      },
      // 個案年齡
      age: {
        type: String,
      },
      // 婚姻狀況
      marriage: {
        type: String,
        trim: true,
      },
      // 婚姻
      marriages: {
        type: Array,
      },
      // 註明日期
      time: {
        type: String,
        trim: true,
      },
      // 伴侶健康狀態
      partnerStatus: {
        type: String,
        trim: true,
      },
      // 伴侶年齡
      partnerAge: {
        type: String,
        trim: true,
      },
      // 是否為個案
      isCase: {
        type: Boolean,
        trim: true,
      },
      // 上一代成員
      parent: {
        type: Number,
      },
      // 上一代第幾段婚姻
      parentNumber: {
        type: Number,
      },
      // SWOT分析
      swot: {
        // 優勢
        S: {
          type: String,
          trim: true,
        },
        // 劣勢
        W: {
          type: String,
          trim: true,
        },
        // 機會
        O: {
          type: String,
          trim: true,
        },
        // 威脅
        T: {
          type: String,
          trim: true,
        },
      },
    }],
    // 是否為暫存
    isTemp: {
      type: Boolean,
      default: false,
    },
    // 是否已畫個案同住
    isDraw: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.CASECHART}s`,
  }
);

_schema.index({ caseId: 1 });

module.exports = {
  modelName: modelCodes.CASECHART,
  schema: _schema,
};
