/**
 * FeaturePath: Common-Model--表單範本
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-04 04:50:38 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const {
  modelCodes, formCategoryCodes, formReviewTypeCodes,
} = require('../../domain');

const _schema = new BaseSchema(
  {
    // 內部表單編號
    internalCode: {
      type: String,
      trim: true,
    },
    // 資料來源
    clientDomain: {
      type: String,
      trim: true,
    },
    // 服務類別
    serviceTypes: {
      type: Array,
    },
    // 公司id
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
    },
    // 表單主類別
    category: {
      type: String,
      enum: Object.values(formCategoryCodes),
    },
    // 表單次類別
    type: {
      type: String,
      trim: true,
    },
    // 表單版本
    version: {
      type: String,
      trim: true,
    },
    // 表單名稱
    name: {
      type: String,
      trim: true,
    },
    // 表單審核類別
    reviewType: {
      type: Number,
      enum: Object.values(formReviewTypeCodes),
    },
    // 表單審核角色
    reviewRoles: {
      type: Array,
    },
    // 表單頻率
    frequency: {
      type: String,
      trim: true,
    },
    // 日照選單分類(直接填寫顯示字串):ex:收托量表/收托評估/收托紀錄/其他
    displayGroup: {
      type: String,
    },
    // 填表角色(for 相容1.5)
    fillRoles: {
      type: Array,
    },
    // 檢視角色(for 相容1.5)
    viewRoles: {
      type: Array,
    },
    // 簽名設定列表
    signatures: [{
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.FORMSIGNATURE}`,
    }],
    // 表單現正使用中
    inUse: {
      type: Boolean,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.FORM}s`,
  }
);

// eslint-disable-next-line object-curly-newline
_schema.index({ companyId: 1, category: 1, type: 1, inUse: 1 });

module.exports = {
  modelName: modelCodes.FORM,
  schema: _schema,
};
