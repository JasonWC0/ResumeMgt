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
const { CaseStatusHistoryController } = require('../../controllers/migration');

const _router = new Router();
_router.prefix('/cases')
  .post('/statusHistories', CaseStatusHistoryController.upsert);

module.exports = _router;
