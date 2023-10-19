/**
 * FeaturePath: Common-Model--機構常用藥時間
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-used-time.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-08 11:53:13 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 機構(公司)Id
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
    },
    // 早餐前時間
    beforeBreakfast: {
      type: String,
      trim: true,
    },
    // 早餐後時間
    afterBreakfast: {
      type: String,
      trim: true,
    },
    // 午餐前時間
    beforeLunch: {
      type: String,
      trim: true,
    },
    // 午餐後時間
    afterLunch: {
      type: String,
      trim: true,
    },
    // 晚餐前時間
    beforeDinner: {
      type: String,
      trim: true,
    },
    // 晚餐後時間
    afterDinner: {
      type: String,
      trim: true,
    },
    // 睡前時間
    beforeBedtime: {
      type: String,
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.MEDICINEUSEDTIME}s`,
  }
);

_schema.index({ companyId: 1, valid: 1 });

module.exports = {
  modelName: modelCodes.MEDICINEUSEDTIME,
  schema: _schema,
};
