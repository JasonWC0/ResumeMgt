/**
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設角色
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: role-default-service.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-12 09:49:27 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes, manageAuthLevelCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 服務類型Id
    serviceGroupId: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: `${modelCodes.SERVICEGROUP}`,
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
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.ROLEDEFAULTSERVICE}s`,
  }
);

_schema.index({ serviceGroupId: 1, role: 1 }, { unique: true });

module.exports = {
  modelName: modelCodes.ROLEDEFAULTSERVICE,
  schema: _schema,
};
