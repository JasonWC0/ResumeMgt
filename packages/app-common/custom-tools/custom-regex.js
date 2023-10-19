/**
 * FeaturePath: Common-Utility--Regex檢查
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-regex.js
 * Project: @erpv3/app-common
 * File Created: 2022-02-08 10:07:48 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { regionCodes } = require('../custom-codes');

const _TW = {
  PERSONID: /^[A-Z]{1}[1-2]{1}[0-9]{8}$/,
  FOREIGNID: /^[A-Z]{1}[8-9]{1}[0-9]{8}$/,
  CELLPHONE: /^09\d{8}$/,
  CITIZENDIGICERTBARCODE: /^[A-Z]{2}[0-9]{14}$/,
  CELLPHONEBARCODE: /^\/{1}[0-9A-Z+-.]{7}$/,
  COMPANYIDENTIFIER: /^[0-9]{8}$/,
  NPOCODE: /^[0-9]{3,7}$/,
};

const _CN = {
  PERSONID: /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$)/, // 簡易版18/15碼
  FOREIGNID: /^[a-zA-Z]{3}\d{12}$/,
  CELLPHONE: /^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/,
};

const _COMMON = {
  DATE: /^[1-9]\d{3}\/(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])$/,
  EMAIL: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
  HOURMINUTETIME: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  DATETIME: /^[1-9]\d{3}\/(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1]) ([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
  YEAR: /^[1-9]\d{3}$/,
  MONTH: /^(0[1-9]|1[0-2])$/,
  DAY: /^(0[1-9]|[1-2][0-9]|3[0-1])$/,
};

const _MAP = {
  [regionCodes.taiwan]: _TW,
  [regionCodes.china]: _CN,
};

class CustomRegex {
  static personId(val, region = '') {
    if (!(region in _MAP)) { return true; }
    if (!('PERSONID' in _MAP[region])) { return true; }
    return _MAP[region].PERSONID.test(val);
  }

  static foreignId(val, region = '') {
    if (!(region in _MAP)) { return true; }
    if (!('FOREIGNID' in _MAP[region])) { return true; }
    return _MAP[region].FOREIGNID.test(val);
  }

  static cellPhone(val, region = '') {
    if (!(region in _MAP)) { return true; }
    if (!('CELLPHONE' in _MAP[region])) { return true; }
    return _MAP[region].CELLPHONE.test(val);
  }

  static citizenDigiCertBarcode(val, region = '') {
    if (!(region in _MAP)) { return true; }
    if (!('CITIZENDIGICERTBARCODE' in _MAP[region])) { return true; }
    return _MAP[region].CITIZENDIGICERTBARCODE.test(val);
  }

  static cellPhoneBarcode(val, region = '') {
    if (!(region in _MAP)) { return true; }
    if (!('CELLPHONEBARCODE' in _MAP[region])) { return true; }
    return _MAP[region].CELLPHONEBARCODE.test(val);
  }

  static companyIdentifier(val, region = '') {
    if (!(region in _MAP)) { return true; }
    if (!('COMPANYIDENTIFIER' in _MAP[region])) { return true; }
    return _MAP[region].COMPANYIDENTIFIER.test(val);
  }

  static npoCode(val, region = '') {
    if (!(region in _MAP)) { return true; }
    if (!('NPOCODE' in _MAP[region])) { return true; }
    return _MAP[region].NPOCODE.test(val);
  }

  static email(val) {
    return _COMMON.EMAIL.test(val);
  }

  static dateFormat(val) {
    return _COMMON.DATE.test(val);
  }

  static hourMinuteFormat(val) {
    return _COMMON.HOURMINUTETIME.test(val);
  }

  static dateTimeFormat(val) {
    return _COMMON.DATETIME.test(val);
  }

  static yearFormat(val) {
    return _COMMON.YEAR.test(val);
  }

  static monthFormat(val) {
    return _COMMON.MONTH.test(val);
  }

  static dayFormat(val) {
    return _COMMON.DAY.test(val);
  }
}

module.exports = CustomRegex;
