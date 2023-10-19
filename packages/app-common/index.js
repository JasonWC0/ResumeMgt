/**
 * FeaturePath: Common-BaseObject--
 * FeaturePath: Common-Utility--工具列表
 * FeaturePath: Common-Enum--通用碼列表
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const tools = require('./custom-tools');
const models = require('./custom-models');
const codes = require('./custom-codes');

module.exports = {
  tools,
  models,
  codes,
  LOGGER: tools.customLogger,
};
