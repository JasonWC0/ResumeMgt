/**
 * FeaturePath: Common-Model--假日行事曆
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: calendar.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-18 05:50:36 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { regionCodes } = require('@erpv3/app-common/custom-codes');
const { modelCodes, calendarTypeCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 機構(公司)Id
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
    },
    // 地區
    region: {
      type: String,
      enum: Object.values(regionCodes),
    },
    // 分類
    type: {
      type: Number,
      enum: Object.values(calendarTypeCodes.CalendarTypeCodes),
      required: true,
    },
    // 日期
    date: {
      type: Date,
      required: true,
    },
    // 時間
    time: {
      type: String,
    },
    // 備註/內容
    note: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.CALENDAR}s`,
  }
);

// eslint-disable-next-line object-curly-newline
_schema.index({ valid: 1, companyId: 1, date: 1, type: 1 });

module.exports = {
  modelName: modelCodes.CALENDAR,
  schema: _schema,
};
