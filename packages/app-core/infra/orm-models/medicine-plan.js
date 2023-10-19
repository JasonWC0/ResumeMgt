/**
 * FeaturePath: Common-Model--用藥計畫
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-plan.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-12 01:39:04 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes, medicineUsedFrequencyCodes, medicineUsedTimingTypeCodes } = require('../../domain');
const { FileSchema } = require('./common-schema');

const _schema = new BaseSchema(
  {
    // 機構(公司)Id
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
    },
    // 個案Id
    caseId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.CASE}`,
    },
    // 個案姓名
    caseName: {
      type: String,
      trim: true,
    },
    // 用藥計畫名稱
    planName: {
      type: String,
      trim: true,
    },
    // 施藥人員PersonId
    workerId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.PERSON}`,
    },
    // 施藥人員姓名
    workerName: {
      type: String,
      trim: true,
    },
    // 醫院/診所
    hospital: {
      type: String,
      trim: true,
    },
    // 醫生姓名
    doctor: {
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
    // 藥品列表
    medicines: [{
      _id: false,
      // 自訂藥品Id
      medicineId: {
        type: SchemaTypes.ObjectId,
        ref: `${modelCodes.CUSTOMMEDICINE}`,
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
      // 藥品備註
      remark: {
        type: String,
        trim: true,
      },
    }],
    // 計畫備註
    remark: {
      type: String,
      trim: true,
    },
    // 用藥計畫圖片
    images: [{
      type: FileSchema,
    }],
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.MEDICINEPLAN}s`,
  }
);

_schema.index({ companyId: 1, valid: 1 });
_schema.index({ caseId: 1, valid: 1 });

module.exports = {
  modelName: modelCodes.MEDICINEPLAN,
  schema: _schema,
};
