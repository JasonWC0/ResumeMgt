/**
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設功能
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: service-group.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-28 06:26:50 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 服務類型組別
    code: {
      type: String,
      trim: true,
      required: true,
    },
    // 顯示文字
    name: {
      type: String,
      trim: true,
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
    collection: `${modelCodes.SERVICEGROUP}s`,
  }
);

_schema.index({ code: 1 }, { unique: true });

module.exports = {
  modelName: modelCodes.SERVICEGROUP,
  schema: _schema,
};
