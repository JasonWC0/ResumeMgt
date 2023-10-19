/**
 * FeaturePath: Common-Model--機構員工角色
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: role-authorization.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-15 06:00:37 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes, manageAuthLevelCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 公司Id
    companyId: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: `${modelCodes.COMPANY}`,
    },
    // 員工角色
    role: {
      type: Number,
      required: true,
    },
    // 角色名稱
    name: {
      type: String,
      required: true,
    },
    // 管理角色權限等級
    manageAuthLevel: {
      type: Number,
      enum: Object.values(manageAuthLevelCodes),
    },
    // 選單/頁面功能設定
    pageAuth: {
      type: Object,
    },
    // 報表群/報表功能設定
    reportAuth: {
      type: Object,
    },
    // 預設角色
    isDefault: {
      type: Boolean,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.ROLEAUTHORIZATION}s`,
  }
);

_schema.index({ companyId: 1, role: 1 }, { unique: true });

module.exports = {
  modelName: modelCodes.ROLEAUTHORIZATION,
  schema: _schema,
};
