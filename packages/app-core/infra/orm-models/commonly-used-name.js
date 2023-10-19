/**
 * FeaturePath: Common-Model--常用名稱
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: commonly-used-name.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-08 03:05:27 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes, commonlyUsedNameCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 機構(公司)Id
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
    },
    // 常用名稱類別
    type: {
      type: String,
      enum: Object.values(commonlyUsedNameCodes),
    },
    // 常用名稱
    name: [{
      type: String,
      trim: true,
    }],
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.COMMONLYUSEDNAME}s`,
  }
);

_schema.index({ companyId: 1, type: 1, valid: 1 });

module.exports = {
  modelName: modelCodes.COMMONLYUSEDNAME,
  schema: _schema,
};
