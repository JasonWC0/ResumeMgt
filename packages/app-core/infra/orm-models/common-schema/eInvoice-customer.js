/**
 * FeaturePath: Common-Model-Base-電子發票顧客
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: eInvoice-customer.js
 * Project: @erpv3/app-core
 * File Created: 2023-03-07 02:16:39 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { Schema } = require('mongoose');

const _schema = new Schema({
  _id: false,
  // 名稱
  name: {
    type: String,
    trim: true,
  },
  // 地址
  address: {
    type: String,
    trim: true,
  },
  // 手機
  mobile: {
    type: String,
    trim: true,
  },
  // 電子信箱
  email: {
    type: String,
    trim: true,
  },
});

module.exports = _schema;
