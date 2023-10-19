/* eslint-disable no-multi-spaces */
/**
 * FeaturePath: Common-Enum--發票狀態
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: eInvoice-status-codes.js
 * Project: @erpv3/app-core
 * File Created: 2023-03-07 11:10:28 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

// 發票狀態
const statusCodes = {
  unIssued: 0, // 未開立
  issue: 1,    // 開立
  invalid: 2,  // 作廢
  void: 3,     // 註銷
};

// 字軌類別
const invTypeCodes = {
  general: '07',  // 一般稅額
  special: '08', // 特種稅額
};

// 課稅類別
const taxTypeCodes = {
  taxable: 1,     // 應稅
  zeroTaxRate: 2, // 零稅率
  taxFree: 3,     // 免稅
  spTaxable: 4,   // 應稅(特種稅率)
  mixture: 9,     // 混合(應稅+免稅 or 應稅+零稅率)
};

// 特種稅額類別
const specialTaxTypeCodes = {
  type0: 0, // 一般
  type1: 1, // 代表酒家及有陪侍服務之茶室、咖啡廳、酒吧之營業稅稅率，稅率為25%
  type2: 2, // 代表夜總會、有娛樂節目之餐飲店之營業稅稅率，稅率為15%
  type3: 3, // 代表銀行業、保險業、信託投資業、證券業、期貨業、票券業及典當業之專屬本業收入(不含銀行業、保險業經營銀行、保險本業收入)之營業稅稅率，稅率為2%
  type4: 4, // 代表保險業之再保費收入之營業稅稅率，稅率為1%
  type5: 5, // 代表銀行業、保險業、信託投資業、證券業、期貨業、票券業及典當業之非專屬本業收入之營業稅稅率，稅率為5%
  type6: 6, // 代表銀行業、保險業經營銀行、保險本業收入之營業稅稅率(適用於民國103年07月以後銷售額)，稅率為5%
  type7: 7, // 代表銀行業、保險業經營銀行、保險本業收入之營業稅稅率(適用於民國103年06月以前銷售額)，稅率為5%
  type8: 8, // 代表空白為免稅或非銷項特種稅額之資料
};

// 通關方式
const clearanceMarkCodes = {
  null: null,
  exportedNotThruCustoms: 1,  // 非經海關出口
  exportedThruCustoms: 2,     // 經海關出口
};

// 載具類別
const carrierTypeCodes = {
  none: 0, // 無載具
  service: 1, // 平台發票載具(例: 綠界電子發票載具)
  citizenDigiCertBarcode: 2, // 自然人憑證號碼
  cellPhoneBarcode: 3,  // 手機條碼載具
};

// 發票期別
const termCodes = {
  JanFeb: 1,
  MarApr: 2,
  MayJun: 3,
  JulAug: 4,
  SepOct: 5,
  NovDec: 6,
};

// 發票上傳後接收狀態
const uploadGovStatusCodes = {
  null: null,
  fail: 0,      // 失敗
  success: 1,   // 成功
  waiting: 2,   // 處理中(待財政部回復狀態)
  uploading: 3, // 處理中(上傳財政部中)
};

// 中獎旗標
const prizeCodes = {
  null: null,       // 未對獎、不可對獎(捐贈之發票)
  lose: 0,          // 未中獎
  win: 1,           // 已中獎
  hasIdentifier: 2, // 有統編之發票
};

// 中獎獎別
const winningPrizeCodes = {
  none: 0,          // 未中獎
  firstPrize: 1,    // 頭獎: 20萬
  secondPrize: 2,   // 二獎: 4萬
  thirdPrize: 3,    // 三獎: 1萬
  fourthPrize: 4,   // 四獎: 4千
  fifthPrize: 5,    // 五獎: 1千
  sixthPrize: 6,    // 六獎: 2百
  grandPrize: 7,    // 特獎: 200萬
  specialPrize: 8,  // 特別獎: 1000萬
  cloud2tPrize: 9,  // 雲端2千
  cloud1mPrize: 10, // 雲端100萬
  cloud5hPrize: 11, // 雲端500
  cloud8hPrize: 12, // 雲端800
};

module.exports = {
  eInvoiceStatusCodes: statusCodes,
  invTypeCodes,
  taxTypeCodes,
  specialTaxTypeCodes,
  clearanceMarkCodes,
  carrierTypeCodes,
  termCodes,
  uploadGovStatusCodes,
  prizeCodes,
  winningPrizeCodes,
};
