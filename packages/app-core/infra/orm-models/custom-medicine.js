/**
 * FeaturePath: Common-Model--客製藥品資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-medicine.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-09 04:11:19 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes, customMedicineCategoryCodes } = require('../../domain');
const { FileSchema } = require('./common-schema');

const _schema = new BaseSchema(
  {
    // 機構(公司)Id
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
    },
    // 藥品類別
    category: {
      type: Number,
      enum: Object.values(customMedicineCategoryCodes),
      required: [true, '藥品類別為必填欄位'],
      default: customMedicineCategoryCodes.custom,
    },
    // 共用藥品資料庫Id
    sharedMedicineId: {
      type: String,
    },
    // 藥品代碼:[藥品類別.共用]則為健保碼，[藥品類別.自訂]則為流水號加前綴碼與健保碼區隔
    drugCode: {
      type: String,
    },
    // 藥品ATC碼
    atcCode: {
      type: String,
    },
    // 藥品許可證號
    licenseCode: {
      type: String,
    },
    // 藥品中文名稱
    chineseName: {
      type: String,
      required: [true, '藥品中文名稱為必填欄位'],
    },
    // 藥品英文名稱
    englishName: {
      type: String,
    },
    // 藥品學名
    genericName: {
      type: String,
    },
    // 適應症
    indications: {
      type: String,
    },
    // 副作用
    sideEffects: {
      type: String,
    },
    // 劑型
    form: {
      type: String,
    },
    // 劑量
    doses: {
      type: Number,
    },
    // 劑量單位
    doseUnit: {
      type: String,
    },
    // 儲存條件
    storageConditions: {
      type: String,
    },
    // 衛教重點
    healthEducation: {
      type: String,
    },
    // 用藥資訊
    usageInfo: {
      type: String,
    },
    // 藥品備註
    remark: {
      type: String,
    },
    // 藥品照片
    images: [{
      type: FileSchema,
    }],
    // 是否啟用
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.CUSTOMMEDICINE}s`,
  }
);

_schema.index({ companyId: 1, drugCode: 1, valid: 1 });
_schema.index({ companyId: 1, atcCode: 1, valid: 1 });

module.exports = {
  modelName: modelCodes.CUSTOMMEDICINE,
  schema: _schema,
};
