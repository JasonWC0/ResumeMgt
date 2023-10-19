/**
 * FeaturePath: Common-Model--銀行資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: bank.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-27 01:41:54 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 銀行代碼
    code: {
      type: String,
      trim: true,
    },
    // 銀行名稱
    name: {
      type: String,
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.BANK}s`,
  }
);

module.exports = {
  modelName: modelCodes.BANK,
  schema: _schema,
};
