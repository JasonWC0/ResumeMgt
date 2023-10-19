/**
 * FeaturePath: Common-Model-Base-電子發票商品項目
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: eInvoice-item.js
 * Project: @erpv3/app-core
 * File Created: 2023-03-07 02:15:51 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { Schema } = require('mongoose');
const { taxTypeCodes } = require('../../../domain/enums/eInvoice-codes');

const _schema = new Schema({
  _id: false,
  // 名稱
  name: {
    type: String,
    trim: true,
  },
  // 數量
  count: {
    type: Number,
  },
  // 單位
  word: {
    type: String,
    trim: true,
  },
  // 單價
  price: {
    type: Number,
  },
  // 商品課稅別
  taxType: {
    type: Number,
    enum: Object.values(taxTypeCodes),
  },
  // 合計
  amount: {
    type: Number,
  },
  // 備註
  note: {
    type: String,
    trim: true,
  },
});

module.exports = _schema;
