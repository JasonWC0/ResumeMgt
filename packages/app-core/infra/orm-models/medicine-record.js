/* eslint-disable object-curly-newline */
/**
 * FeaturePath: Common-Model--用藥紀錄
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-record.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-22 11:36:46 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes, medicineRecordStatusCodes, medicineUsedFrequencyCodes, medicineUsedTimingTypeCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 機構(公司)Id
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
    },
    // 用藥計畫Id
    planId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.PLAN}`,
    },
    // 用藥計畫名稱
    planName: {
      type: String,
      trim: true,
    },
    // 用藥計畫開始日期
    planStartDate: {
      type: Date,
    },
    // 用藥計畫結束日期
    planEndDate: {
      type: Date,
    },
    // 預計用藥時間 (plan設定) { type: 0, content: Number }, { type: 1, content: String }
    expectedUseTiming: {
      // 用藥時間類型
      type: {
        type: Number,
        enum: Object.values(medicineUsedTimingTypeCodes),
      },
      // 用藥時間內容
      content: {
        type: SchemaTypes.Mixed,
      },
    },
    // 預計用藥時間
    expectedUseAt: {
      type: Date,
    },
    // 實際用藥時間
    actualUseAt: {
      type: Date,
    },
    // 個案Id
    caseId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.CASE}`,
    },
    // 個案名稱
    caseName: {
      type: String,
      trim: true,
    },
    // 實際施藥人員Id
    workerId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.PERSON}`,
    },
    // 實際施藥人員名稱
    workerName: {
      type: String,
      trim: true,
    },
    // 用藥提醒紀錄狀態
    status: {
      type: Number,
      enum: Object.values(medicineRecordStatusCodes),
    },
    // 藥品列表
    medicines: [{
      _id: false,
      // 自訂藥品Id
      medicineId: {
        type: SchemaTypes.ObjectId,
        ref: `${modelCodes.CUSTOMMEDICINE}`,
      },
      // 藥品代碼:[藥品類別.共用]則為健保碼，[藥品類別.自訂]則為流水號加前綴碼與健保碼區隔
      drugCode: {
        type: String,
      },
      // 藥品ATC碼
      atcCode: {
        type: String,
      },
      // 藥品中文名稱
      chineseName: {
        type: String,
        required: [true, '藥品中文名稱為必填欄位'],
      },
      // 藥品英文名稱
      englishName: {
        type: String,
      },
      // 適應症
      indications: {
        type: String,
      },
      // 用藥資訊
      usageInfo: {
        type: String,
      },
      // 劑型
      form: {
        type: String,
      },
      // 劑量
      doses: {
        type: Number,
      },
      // 劑量單位
      doseUnit: {
        type: String,
      },
      // 用量
      quantityOfMedUse: {
        type: String,
        trim: true,
      },
      // 用藥頻率 { type: 0, content: null }, { type: 1, content: Number }, { type: 2, content: [Number] }, { type: 3, content: [Date] }
      useFreq: {
        // 用藥頻率類型
        type: {
          type: Number,
          enum: Object.values(medicineUsedFrequencyCodes),
        },
        // 用藥頻率內容
        content: {
          type: SchemaTypes.Mixed,
        },
      },
      // 用藥時間 { type: 0, content: [Number] }, { type: 1, content: [String] }
      useTiming: {
        // 用藥時間類型
        type: {
          type: Number,
          enum: Object.values(medicineUsedTimingTypeCodes),
        },
        // 用藥時間內容
        content: {
          type: SchemaTypes.Mixed,
        },
      },
      // 是否使用藥
      isUsed: {
        type: Boolean,
        default: null,
      },
    }],
    // 用藥紀錄備註
    remark: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.MEDICINERECORD}s`,
  }
);

_schema.index({ companyId: 1, expectedUseAt: 1, actualUseAt: 1, valid: 1 });
_schema.index({ companyId: 1, caseId: 1, valid: 1 });
_schema.index({ companyId: 1, workerId: 1, valid: 1 });
_schema.index({ companyId: 1, planName: 1, valid: 1 });

module.exports = {
  modelName: modelCodes.MEDICINERECORD,
  schema: _schema,
};
