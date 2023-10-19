/**
 * FeaturePath: Common-Model--報表
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: report-table.js
 * Project: @erpv3/app-core
 * File Created: 2022-09-05 07:12:23 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes, generateReportStatusCodes } = require('../../domain');
const { FileSchema } = require('./common-schema');

const _schema = new BaseSchema(
  {
    // 報表類型
    type: {
      type: String,
      trim: true,
    },
    // 機構(公司)Id
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
    },
    // 報表年份
    year: {
      type: Number,
    },
    // 報表月份
    month: {
      type: Number,
    },
    // 報表日期
    date: {
      type: Date,
    },
    // 報表起始時間
    startDate: {
      type: Date,
    },
    // 報表結束時間
    endDate: {
      type: Date,
    },
    // 服務代碼
    serviceCode: {
      type: String,
      trim: true,
    },
    // 檔案產生所需時間(sec.)
    produceTime: {
      type: Number,
    },
    // 產出報表狀態
    genStatus: {
      type: Number,
      enums: Object.values(generateReportStatusCodes),
    },
    // 報表檔案資料(儲存服務)
    reportFile: {
      type: FileSchema,
    },
    // Request資料
    requestInfo: {
      // request api/ur
      url: {
        type: String,
        trim: true,
      },
      // request body內容
      body: {
        type: Object,
      },
      // 登入操作者的人員Id
      personId: {
        type: SchemaTypes.ObjectId,
        ref: `${modelCodes.PERSON}`,
      },
      // 登入操作者的公司Id
      companyId: {
        type: SchemaTypes.ObjectId,
        ref: `${modelCodes.COMPANY}`,
      },
    },
    // 一次性報表(非分析報表)
    once: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.REPORTMAIN}`,
  }
);

_schema.index({ companyId: 1, type: 1, valid: 1 });

module.exports = {
  modelName: modelCodes.REPORTMAIN,
  schema: _schema,
};
