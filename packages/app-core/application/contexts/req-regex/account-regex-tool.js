/**
 * FeaturePath: 經營管理-系統管理-帳號權限-新增帳號
 * FeaturePath: 經營管理-系統管理-帳號權限-編輯帳號
 * FeaturePath: 經營管理-人事管理-員工資料-新增基本資料
 * FeaturePath: 經營管理-人事管理-員工資料-更新基本資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: account-regex-tool.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-20 10:56:25 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomError } = require('@erpv3/app-common/custom-models');
const { coreErrorCodes } = require('../../../domain');

function _accountRegex(account) {
  const _regex = /^[-a-z0-9_.@]{3,64}$/;
  const _account = account.toLowerCase();
  const valid = _regex.test(_account);
  if (!valid) { throw new CustomError(coreErrorCodes.ERR_ACCOUNT_RULE_NOT_VALID); }
}

function _passwordRegex(pwd) {
  const _regexList = [/^(?![\u4e00-\u9fa5|\uff00-\uffff]).{6,64}$/, /^(.(?![\u4e00-\u9fa5|\uff00-\uffff])){6,64}$/];
  const valid = _regexList.some((_regex) => _regex.test(pwd));
  if (!valid) { throw new CustomError(coreErrorCodes.ERR_PASSWORD_RULE_NOT_VALID); }
}

module.exports = {
  accountRegex: _accountRegex,
  passwordRegex: _passwordRegex,
};
