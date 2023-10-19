/**
 * FeaturePath: Common-Model--Token
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: token.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-24 02:39:37 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { Schema, SchemaTypes } = require('mongoose');
const { modelCodes } = require('../../domain');

const _schema = new Schema(
  {
    // token
    token: {
      type: String,
      trim: true,
      required: true,
    },
    // 帳號Id
    accountId: {
      type: SchemaTypes.ObjectId,
    },
    // 登入帳號
    account: {
      type: String,
      trim: true,
    },
    // 企業CorporationId
    corpId: {
      type: SchemaTypes.ObjectId,
    },
    // 多公司資料{id: { 全名, 頁面頁籤權限 } } "companies._id": { fullName, pageAuth, manageAuthLevel }
    companies: {
      type: Object,
    },
    // 登入者personId
    personId: {
      type: SchemaTypes.ObjectId,
    },
    // 登入者姓名
    name: {
      type: String,
      trim: true,
    },
    // 更新時間
    updatedAt: {
      default: new Date(),
      expires: 4 * 86400, // 4 day
      type: Date,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.TOKEN}s`,
  }
);

_schema.index({ token: 1 }, { unique: true });

module.exports = {
  modelName: modelCodes.TOKEN,
  schema: _schema,
};
