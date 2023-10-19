/**
 * FeaturePath: Common-Model--審核狀態
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-review-status.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-10 02:32:09 pm
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
    // 表單結果id
    fid: {
      type: SchemaTypes.ObjectId,
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
    // 審核角色
    reviewRoles: {
      type: Array,
    },
    // 審核人
    reviewers: {
      type: Array,
      trim: String,
    },
    // 目前簽核到第幾層
    layerAt: {
      type: Number,
    },
    // 目前簽核角色列表
    nowReviewRole: {
      type: Array,
    },
    // 目前簽核人
    nowReviewer: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.PERSON}`,
    },
    // 表單建立時間
    submittedAt: {
      type: Date,
      trim: true,
    },
    // 狀態
    status: {
      type: Number,
    },
    // 審核意見
    comment: {
      type: String,
      trim: true,
    },
    // 填表人姓名
    fillerName: {
      type: String,
      trim: true,
    },
    // 目前最後審核人姓名
    lastReviewerName: {
      type: String,
      trim: true,
    },
    // 內容/表單名稱
    content: {
      type: String,
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.FORMREVIEWSTATUS}es`,
  }
);

// eslint-disable-next-line object-curly-newline
_schema.index({ fid: 1, category: 1, type: 1, companyId: 1 });

module.exports = {
  modelName: modelCodes.FORMREVIEWSTATUS,
  schema: _schema,
};
