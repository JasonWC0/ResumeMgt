/**
 * FeaturePath: Common-Model--電子發票
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: eInvoice.js
 * Project: @erpv3/app-core
 * File Created: 2023-03-07 11:01:05 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes } = require('../../domain');
const {
  prizeCodes,
  invTypeCodes,
  taxTypeCodes,
  carrierTypeCodes,
  winningPrizeCodes,
  clearanceMarkCodes,
  eInvoiceStatusCodes,
  specialTaxTypeCodes,
  uploadGovStatusCodes,
} = require('../../domain/enums/eInvoice-codes');
const { EInvoiceCustomerSchema, EInvoiceItemSchema } = require('./common-schema');

const _schema = new BaseSchema(
  {
    // 機構(公司)Id
    companyId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.COMPANY}`,
      required: true,
    },
    // 結帳編號
    serialString: {
      type: String,
      required: true,
      trim: true,
    },
    // 個案Id
    caseId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.CASE}`,
      required: true,
    },
    // 發票號碼
    invoiceNumber: {
      type: String,
      trim: true,
    },
    // 開立時間
    issuedDate: {
      type: Date,
    },
    // 狀態
    status: {
      type: Number,
      enum: Object.values(eInvoiceStatusCodes),
    },
    // 字軌類別
    invType: {
      type: String,
      enum: Object.values(invTypeCodes),
    },
    // 課稅類別
    taxType: {
      type: Number,
      enum: Object.values(taxTypeCodes),
    },
    // 特種稅額類別
    specialTaxType: {
      type: Number,
      enum: Object.values(specialTaxTypeCodes),
    },
    // 通關方式
    clearanceMark: {
      type: Number,
      enum: Object.values(clearanceMarkCodes),
    },
    // 商品單價是否含稅
    vat: {
      type: Boolean,
    },
    // 列印與否
    print: {
      type: Boolean,
    },
    // 列印網址
    printUrl: {
      type: String,
      trim: true,
    },
    // 捐贈與否
    donation: {
      type: Boolean,
    },
    // 捐贈碼
    npoCode: {
      type: String,
      trim: true,
    },
    // 載具類別
    carrierType: {
      type: Number,
      enum: Object.values(carrierTypeCodes),
    },
    // 載具編號
    carrierNum: {
      type: String,
      trim: true,
    },
    // 發票金額(含稅)
    amount: {
      type: Number,
    },
    // 折讓後剩餘金額
    afterAllowanceAmount: {
      type: Number,
    },
    // (買方)統一編號
    identifier: {
      type: String,
      trim: true,
    },
    // 備註
    note: {
      type: String,
      trim: true,
    },
    // 買方資料
    customer: {
      type: EInvoiceCustomerSchema,
    },
    // 商品列表
    items: [{
      type: EInvoiceItemSchema,
    }],
    // 作廢原因
    invalidReason: {
      type: String,
      trim: true,
    },
    // 註銷原因
    voidReason: {
      type: String,
      trim: true,
    },
    // 稅率
    taxRate: {
      type: Number,
    },
    // 稅金 (a.有統編: 有值, b.沒有統編: 稅金包含在發票金額內, 值為0)
    taxAmount: {
      type: Number,
    },
    // 上傳狀態
    uploadStatus: {
      type: Boolean,
    },
    // 上傳時間
    uploadDate: {
      type: Date,
    },
    // 上傳後接收狀態
    uploadGovStatus: {
      type: Number,
      enum: Object.values(uploadGovStatusCodes),
      default: uploadGovStatusCodes.null,
    },
    // 中獎旗標
    prize: {
      type: Number,
      enum: Object.values(prizeCodes),
      default: prizeCodes.null,
    },
    // 中獎獎別
    winningPrize: {
      type: Number,
      enum: Object.values(winningPrizeCodes),
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.EINVOICE}s`,
  }
);

_schema.index({ valid: 1, companyId: 1 });

module.exports = {
  modelName: modelCodes.EINVOICE,
  schema: _schema,
};
