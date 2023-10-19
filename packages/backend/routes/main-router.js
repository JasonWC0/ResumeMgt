/**
 * FeaturePath: Common-System--
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: main-router.js
 * Project: @erpv3/backend
 * File Created: 2022-02-09 12:41:51 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const conf = require('@erpv3/app-common/shared/config');
const { version } = require('../../../package.json');

const prefix = conf.SERVICE.PREFIX;
const _mainRouter = new Router();

_mainRouter.prefix('/');
_mainRouter.get(`${prefix}`, async (ctx) => {
  ctx.status = 200;
  ctx.body = version || '';
});

module.exports = _mainRouter;
