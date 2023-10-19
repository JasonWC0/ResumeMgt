/**
 * FeaturePath: Common-Model--帳號
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: account.js
 * Project: @erpv3/app-person
 * File Created: 2022-02-08 02:57:57 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 總公司Id
    corpId: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: `${modelCodes.CORPORATION}`,
    },
    // 個人Id
    personId: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: `${modelCodes.PERSON}`,
    },
    // 類型: 0:員工 1:顧客
    type: {
      type: Number,
      required: true,
      enum: [0, 1],
    },
    // account
    account: {
      type: String,
      trim: true,
      required: true,
    },
    // keycloakId
    keycloakId: {
      type: String,
      trim: true,
    },
    // 是否為機構Admin帳號
    companyAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.ACCOUNT}s`,
  }
);

_schema.index({
  corpId: 1, personId: 1, type: 1, valid: 1,
});
_schema.index({ account: 1, valid: 1 }, { unique: true });

module.exports = {
  modelName: modelCodes.ACCOUNT,
  schema: _schema,
};
