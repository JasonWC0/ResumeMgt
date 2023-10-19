/**
 * FeaturePath: Common-Utility--系統參數
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-argvs.js
 * Project: @erpv3/app-common
 * File Created: 2022-02-08 10:07:35 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const yargs = require('yargs');

const _argvs = yargs
  .options({
    logpath: {
      demandOption: false,
      describe: 'Set the logger path',
      default: './logs',
    },
    port: {
      demandOption: false,
      alias: 'p',
      describe: 'Set the http server port',
      default: '9000',
    },
    env: {
      demandOption: false,
      describe: 'Set the execute environment, should be local|dev|prod',
      default: process.env.NODE_ENV || 'test',
    },
    configpath: {
      demandOption: false,
      describe: 'Set the config file path absolutely, default is empty',
      default: '',
    },
  })
  .help()
  .alias('help', 'h')
  .epilogue('Copyright@hand').argv;

module.exports = _argvs;
