/**
 * FeaturePath: Common-Model--個案服務狀態
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { SchemaTypes, Schema } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes } = require('../../domain');

const _baseHistorySchema = new Schema({
  // 日期
  date: {
    type: Date,
  },
  // 狀態
  status: {
    type: Number,
  },
  // 暫停類型
  pendingType: {
    type: Number,
  },
  // 原因
  reason: {
    type: Number,
  },
  // 備註
  memo: {
    type: String,
  },
  // 建立時間
  createdAt: {
    type: Date,
  },
  // 更新時間
  updatedAt: {
    type: Date,
  },
});

const _schema = new BaseSchema(
  {
    // 個案Id
    caseId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.CASE}`,
      required: true,
    },
    // 居家服務歷史紀錄
    hc: [{
      type: _baseHistorySchema,
    }],
    // 社區式服務歷史紀錄
    dc: [{
      type: _baseHistorySchema,
    }],
    // 住宿式服務
    rc: [{
      type: _baseHistorySchema,
    }],
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.CASESTATUSHISTORY.slice(0, -1)}ies`,
  }
);

_schema.index({ caseId: 1 });

module.exports = {
  modelName: modelCodes.CASESTATUSHISTORY,
  schema: _schema,
};
