/* eslint-disable no-multi-spaces */
/**
 * FeaturePath: Common-Enum--用藥紀錄狀態
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-record-status-codes.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-22 02:39:20 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const _codes = {
  Notice: 0,          // 將提醒用藥(未用藥)
  UnTaken: 1,         // 未用藥
  Taken: 2,           // 已用藥
  PartiallyTaken: 3,  // 部分用藥
  CaseLeave: 4,       // 個案請假
};
module.exports = _codes;
