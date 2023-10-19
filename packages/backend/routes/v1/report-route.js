/**
 * FeaturePath: 經營管理-報表產出-通用-C
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: report-route.js
 * Project: @erpv3/backend
 * File Created: 2022-09-06 04:19:15 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { ReportController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/')
  .post('/onceReports/:reportType', ReportController.onceGenerate)
  .post('/reports/deleteList', ReportController.deleteList)
  .post('/reports/:reportType', ReportController.createReport)
  .get('/reports/:reportType', ReportController.getList);

module.exports = _router;
