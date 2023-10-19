/**
 * FeaturePath: Common-Enum--用藥紀錄個案狀態
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-record-case-status-codes.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-31 03:33:45 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const _codes = {
  Leave: 0, // 請假
  CancelLeave: 1, // 銷假
  Closed: 2, // 結案
  LongLeave: 3, // 請長假
  CancelLongLeave: 4, // 銷長假
};

module.exports = _codes;
