/**
 * FeaturePath: Common-Model--個案合約
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-service-contract.js
 * Project: @erpv3/app-core
 * File Created: 2022-12-05 11:32:50 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { FileSchema } = require('./common-schema');
const { modelCodes, companyServiceCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 資料建立來源
    clientDomain: {
      type: String,
      trim: true,
    },
    // 公司Id
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
      required: true,
    },
    // 個案Id
    caseId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.CASE}`,
      required: true,
    },
    // 服務類型
    service: {
      type: String,
      enum: Object.values(companyServiceCodes),
      trim: true,
    },
    // 委託人姓名
    principal: {
      type: String,
      trim: true,
    },
    // 合約起始日
    startDate: {
      type: Date,
    },
    // 合約結束日
    endDate: {
      type: Date,
    },
    // 合約檔案
    file: {
      type: FileSchema,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.CASESERVICECONTRACT}s`,
  }
);

_schema.index({ companyId: 1, service: 1 });

module.exports = {
  modelName: modelCodes.CASESERVICECONTRACT,
  schema: _schema,
};
