/**
 * FeaturePath: Common-Enum--報表產生狀態
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: generate-report-status-code.js
 * Project: @erpv3/app-core
 * File Created: 2022-09-05 07:26:14 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const _codes = {
  Null: null,
  processing: 0, // 產生中
  done: 1, // 產生完畢
  fail: 2, // 產生失敗
  empty: 3, // 無資料
};

module.exports = _codes;
