/**
 * FeaturePath: Common-Enum--帳單地址類別
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: bill-place-type-codes.js
 * Project: @erpv3/app-core
 * File Created: 2022-09-07 01:46:21 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const _codes = {
  residencePlace: 0, // 居住地地址
  registerPlace: 1, // 戶籍地地址
  agentResidencePlace: 2, // 代理人(居住地)地址
  other: 3, // 其他
};

module.exports = _codes;
