/**
 * FeaturePath: 個案管理-服務流程管理-暫停結案-v2.5取得服務筆數API串接
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-service-record-route.js
 * Project: @erpv3/backend
 * File Created: 2022-10-20 03:19:15 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const Router = require('@koa/router');
const { CaseServiceRecordController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/caseServiceRecords')
  .get('/', CaseServiceRecordController.list);

module.exports = _router;
