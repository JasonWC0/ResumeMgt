/**
 * FeaturePath: Common-Model--表單結果
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-result.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-15 01:39:20 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes } = require('../../domain');
const { FileSchema } = require('./common-schema');

const _schema = new BaseSchema(
  {
    // 資料建立來源
    clientDomain: {
      type: String,
      trim: true,
    },
    // 表單Id
    formId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.FORM}`,
    },
    // 公司Id
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
    },
    // 表單主類別
    category: {
      type: String,
    },
    // 表單次類別
    type: {
      type: String,
      trim: true,
    },
    // 個案Id
    caseId: {
      type: SchemaTypes.ObjectId,
    },
    // 填寫日期
    fillDate: {
      type: Date,
    },
    // 填寫人
    filler: {
      personId: {
        type: SchemaTypes.ObjectId,
      },
      name: {
        type: String,
        trim: true,
      },
    },
    // 下次評估日期
    nextEvaluationDate: {
      type: Date,
    },
    // 表單結果
    result: {
      type: Object,
    },
    // 上傳檔案
    files: [FileSchema],
    // 簽名設定列表
    signatures: [{
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.FORMSIGNATURE}`,
    }],
    // 建立人
    creator: {
      type: SchemaTypes.ObjectId,
    },
    // 編輯人
    modifier: {
      type: SchemaTypes.ObjectId,
    },
    // 表單建立時間
    submittedAt: {
      type: Date,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.FORMRESULT}s`,
  }
);

// eslint-disable-next-line object-curly-newline
_schema.index({ valid: 1, caseId: 1, category: 1, type: 1 });
_schema.index({ companyId: 1, valid: 1, type: 1 });

module.exports = {
  modelName: modelCodes.FORMRESULT,
  schema: _schema,
};
