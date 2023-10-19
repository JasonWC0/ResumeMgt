/**
 * FeaturePath: Common-Model--審核歷程
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-review-history.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-10 02:43:10 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 資料建立來源
    clientDomain: {
      type: String,
      trim: true,
    },
    // 公司Id
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
    },
    // 表單主類別
    category: {
      type: String,
      trim: true,
    },
    // 表單次類別
    type: {
      type: String,
      trim: true,
    },
    // 表單結果id
    fid: {
      type: SchemaTypes.ObjectId,
    },
    // 新增審核狀態時間
    submittedAt: {
      type: Date,
    },
    // 表單變更的狀況
    status: {
      type: Number,
    },
    // 審核意見
    comment: {
      type: String,
      trim: true,
    },
    // 內容/表單名稱
    content: {
      type: String,
      trim: true,
    },
    // 送單人
    submitter: {
      personId: {
        type: SchemaTypes.ObjectId,
        trim: true,
      },
      name: {
        type: String,
        trim: true,
      },
    },
    // 填表人姓名
    fillerName: {
      type: String,
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.FORMREVIEWHISTORY.slice(0, -1)}ies`,
  }
);

// eslint-disable-next-line object-curly-newline
_schema.index({ fid: 1, category: 1, type: 1 });
_schema.index({ companyId: 1, 'submitter.personId': 1 });

module.exports = {
  modelName: modelCodes.FORMREVIEWHISTORY,
  schema: _schema,
};
