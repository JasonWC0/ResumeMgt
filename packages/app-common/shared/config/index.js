/**
 * FeaturePath: Common-Config--
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const fs = require('fs');
const path = require('path');
const { customLogger, CustomValidator, customArgvs } = require('../../custom-tools');
/**
* @type {configObject}
*/
let _config = null;

customLogger.info(`Run on environment ${customArgvs.env}`);
customLogger.info('Load config start...');
let _configPath = customArgvs.configpath;
if (!CustomValidator.nonEmptyString(_configPath)) {
  customLogger.info('Input argv is empty, load from default...');
  customLogger.info(require.main.path);
  _configPath = path.resolve(require.main.path, `../configs/config.${customArgvs.env}.json`);
}
if (_configPath.startsWith('.') || _configPath.startsWith('..')) {
  throw new Error('Path must be absolutely');
}
customLogger.info(`Check file exist with path ${_configPath}...`);
if (!fs.existsSync(_configPath)) {
  throw new Error(`File not exist with path ${_configPath}`);
}
const data = fs.readFileSync(_configPath);
_config = JSON.parse(data);

module.exports = _config;
