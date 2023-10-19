/**
 * FeaturePath: Common-Enum--個案收費單版本設定類別
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const _hcCodes = {
  standard: 1, // 標準版
  simple: 2, // 簡易版
};

const _dcCodes = {
  standard: 1, // 標準版
  simple: 2, // 簡易版
};

module.exports = {
  HC: _hcCodes,
  DC: _dcCodes,
};
