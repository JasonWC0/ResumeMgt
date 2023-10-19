/**
 * FeaturePath: Common-Enum--錯誤碼
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: error-codes.js
 * Project: @erpv3/app-common
 * File Created: 2022-02-08 09:57:11 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const _codeEnum = {
  SUCCESS: 'SUCCESS',
  ERR_EXEC_DB_FAIL: 'ERR_EXEC_DB_FAIL',
  ERR_JSON_FORMAT_FAIL: 'ERR_JSON_FORMAT_FAIL',
  ERR_DEPRECATED: 'ERR_DEPRECATED',
  ERR_NOT_IMPLEMENT: 'ERR_NOT_IMPLEMENT',
  ERR_EXEC_KEYCLOAK_FAIL: 'ERR_EXEC_KEYCLOAK_FAIL',
  ERR_EXCEPTION: 'ERR_EXCEPTION',
  ERR_AUTHORIZATION: 'ERR_AUTHORIZATION',
  ERR_FILESYSTEM_FAIL: 'ERR_FILESYSTEM_FAIL',
  ERR_URI_NOT_FOUND: 'ERR_URI_NOT_FOUND',
  ERR_HEADERS_INCOMPLETE: 'ERR_HEADERS_INCOMPLETE',
  ERR_DATA_VN_FAIL: 'ERR_DATA_VN_FAIL',
  ERR_EXEC_STORAGE_SERVICE_FAIL: 'ERR_EXEC_STORAGE_SERVICE_FAIL',
};

module.exports = _codeEnum;
