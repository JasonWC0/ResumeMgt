/* eslint-disable no-multi-spaces */
/**
 * FeaturePath: Common-Enum--用藥常用時間
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-used-timing-codes.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-12 04:05:47 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const _codes = {
  beforeBreakfast: 0, // 早餐前
  afterBreakfast: 1,  // 早餐後
  beforeLunch: 2,     // 午餐前
  afterLunch: 3,      // 午餐後
  beforeDinner: 4,    // 晚餐前
  afterDinner: 5,     // 晚餐後
  beforeBedtime: 6,   // 睡前
};

module.exports = _codes;
