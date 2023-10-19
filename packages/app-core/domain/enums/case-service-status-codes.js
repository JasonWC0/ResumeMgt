/**
 * FeaturePath: Common-Enum--個案服務狀態
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

/* eslint-disable no-multi-spaces */
const _codes = {
  service: 0,       // 服務中
  toBoConfirmed: 1, // 待確認
  pending: 2,       // 暫停
  closed: 3,        // 結案
  apply: 4,         // 新申請
  interview: 5,     // 家訪
  contract: 6,      // 契約
  transform: 7,     // 轉介
};

module.exports = _codes;
