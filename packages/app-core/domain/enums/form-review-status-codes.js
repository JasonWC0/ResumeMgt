/* eslint-disable no-multi-spaces */
/**
 * FeaturePath: Common-Enum--審核狀態
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-review-status-codes.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-10 02:53:10 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const _codes = {
  underReview: 1, // 審核中/送審
  withdraw: 2,    // 撤回
  reject: 3,      // 駁回
  approve: 4,     // 通過
  noReview: 5,    // 無需審核
  processing: 6,  // 處理中/暫存
};

module.exports = _codes;
