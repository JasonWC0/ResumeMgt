/**
 * FeaturePath: Common-Model--集團總公司
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: corporation.js
 * Project: @erpv3/app-core
 * File Created: 2022-02-10 10:28:27 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 總公司全名
    fullName: {
      type: String,
      trim: true,
      required: true,
    },
    // 總公司名: SWHQ設定不顯示
    shortName: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    // 總公司簡碼
    code: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    // 總公司個人資料加密設定
    __enc: {
      // 金鑰保管URI
      provider: {
        type: String,
        trim: true,
      },
      // 金鑰Id
      keyId: {
        type: String,
        trim: true,
      },
      // 加解密方式
      method: {
        type: String,
        trim: true,
      },
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.CORPORATION}s`,
  }
);

module.exports = {
  modelName: modelCodes.CORPORATION,
  schema: _schema,
};
