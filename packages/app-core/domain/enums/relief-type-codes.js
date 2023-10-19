/**
 * FeaturePath: Common-Enum--個案福利身分別
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

/* eslint-disable no-multi-spaces */
const _codes = {
  lowIncome: 1,       // 低收入戶
  middleLowIncome: 2, // 中低收入戶
  normal: 3,          // 一般戶
  lessThan25: 4,      // 未達2.5倍(家庭總收入平均分配全家人口之金額達當年度每人每月最低生活費1.5倍以上，未達2.5倍者)
};
module.exports = _codes;
