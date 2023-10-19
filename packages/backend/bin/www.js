/**
 * FeaturePath: Common-System--
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: www.js
 * Project: @erpv3/backend
 * File Created: 2022-02-07 03:44:31 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

global.Promise = require('bluebird');
const http = require('http');
const { LOGGER, tools } = require('@erpv3/app-common');
const App = require('../app');
const AppInit = require('../app-initializer');

LOGGER.info('Initial app start...');
AppInit.tryDefaultDatabase()
  .then(() => AppInit.runSeeder())
  .catch((ex) => LOGGER.error(ex.stack));
AppInit.tryDefaultFile();
AppInit.tryNativeDatabase();

const _core = http.createServer(new App().app);
_core.listen(Number.parseInt(tools.customArgvs.port, 10));
_core.on('listening', () => LOGGER.info(`Server up on ${_core.address().port}`));
_core.on('error', (err) => LOGGER.error(err.stack));
