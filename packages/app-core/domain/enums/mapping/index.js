/**
 * FeaturePath: Common-Enum-對照表-
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const caseMap = require('./case-mapping');
const employeeMap = require('./employee-mapping');
const otherMap = require('./other-mapping');
const v25Map = require('./v25-mapping');

/**
 * @param {Object} Enum 欲查詢的EnumObject
 * @param {*} value 欲查詢的enumKey
 * @param {*} defaultValue 若找不到的預設值
 * @returns {Number}
 */
function _getNumberBooleanKey(Enum, value, defaultValue) {
  const key = Object.keys(Enum).find((_key) => Enum[_key].value === value);
  if (!key) {
    if (!defaultValue || defaultValue != null) {
      return defaultValue;
    }
    return null;
  }
  return key && Enum[key].key;
}

/**
 * @param {Object} Enum 欲查詢的EnumObject
 * @param {*} value 欲查詢的enumKey
 * @param {*} defaultValue 若找不到的預設值
 * @returns {String}
 */
function _getStringKey(Enum, value, defaultValue) {
  const key = Object.keys(Enum).find((_key) => Enum[_key].value === value);
  if (!key) {
    if (!defaultValue) {
      return defaultValue;
    }
    return '';
  }
  return key && Enum[key].key;
}

/**
 * @param {Object} Enum 欲查詢的EnumObject
 * @param {*} key 欲查詢的enumKey
 * @param {*} defaultValue 若找不到的預設值
 * @returns {String}
 */
function _getStringValue(Enum, key, defaultValue) {
  const value = Object.keys(Enum).find((_key) => Enum[_key].key === key);
  if (!value) {
    if (!defaultValue) {
      return defaultValue;
    }
    return '';
  }
  return value && Enum[value].value;
}

/**
 * @description Provide enums
 * @module app-backend/domain/enums
 */
module.exports = {
  caseMap,
  employeeMap,
  otherMap,
  v25Map,
  getNumberBooleanKey: _getNumberBooleanKey,
  getStringKey: _getStringKey,
  getStringValue: _getStringValue,
};
