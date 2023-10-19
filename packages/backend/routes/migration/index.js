/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const Router = require('@koa/router');
const conf = require('@erpv3/app-common/shared/config');
const companyRoute = require('./company-route');
const accountRoute = require('./account-route');
const carePlanRoute = require('./care-plan-route');
const caseRoute = require('./case-route');

const _router = new Router();
_router.prefix(`${conf.SERVICE.PREFIX}/migration/api`);

_router
  .use(companyRoute.routes())
  .use(accountRoute.routes())
  .use(carePlanRoute.routes())
  .use(caseRoute.routes());

module.exports = _router;
