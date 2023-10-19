/**
 * FeaturePath: 經營管理-系統管理-機構服務設定-基本資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: common-route.js
 * Project: @erpv3/backend
 * File Created: 2022-07-27 01:55:07 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { CommonController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/')
  .get('/banks', CommonController.bankList);

module.exports = _router;
