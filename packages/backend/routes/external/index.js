/**
 * FeaturePath: Common-System--
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: index.js
 * Project: @erpv3/backend
 * File Created: 2022-02-08 04:41:13 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { models } = require('@erpv3/app-common');
const conf = require('@erpv3/app-common/shared/config');

const _router = new Router();

_router.prefix(`${conf.SERVICE.PREFIX}/external/api`);
_router.all('/', async (ctx, next) => {
  ctx.state.result = new models.CustomResult();
  return next();
});

module.exports = _router;
