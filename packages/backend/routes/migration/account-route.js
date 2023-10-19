/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: account-route.js
 * Project: @erpv3/backend
 * File Created: 2022-07-05 11:31:51 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { AccountController } = require('../../controllers/migration');

const _router = new Router();
_router.prefix('/')
  .get('/accounts', AccountController.readList);

module.exports = _router;
