/**
 * FeaturePath: Common-Model--護理班別
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: nursing-shift.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-13 01:45:45 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 機構Id
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
      required: true,
    },
    // 護理班別代碼簡稱
    code: {
      type: String,
      trim: true,
      required: true,
    },
    // 護理班別名稱
    name: {
      type: String,
      trim: true,
      required: true,
    },
    // 起始時間HH:mm
    startedAt: {
      type: String,
      trim: true,
    },
    // 結束時間HH:mm
    endedAt: {
      type: String,
      trim: true,
    },
    // 護理班別敘述
    detail: {
      type: String,
      trim: true,
    },
    // 是否休息班
    isDayOff: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.NURSINGSHIFT}s`,
  }
);

_schema.index({ companyId: 1, valid: 1, code: 1 });

module.exports = {
  modelName: modelCodes.NURSINGSHIFT,
  schema: _schema,
};
