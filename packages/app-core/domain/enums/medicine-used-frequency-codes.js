/* eslint-disable no-multi-spaces */
/**
 * FeaturePath: Common-Enum--用藥頻率類別
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-used-frequency-codes.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-12 03:43:40 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const _codes = {
  everyDay: 0,        // 每日
  everyFewDays: 1,    // 每隔幾天
  everyDayOfWeek: 2,  // 每週幾
  specificDay: 3,     // 指定日期
};

module.exports = _codes;
