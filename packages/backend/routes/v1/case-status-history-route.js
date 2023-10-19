/**
 * FeaturePath: 個案管理-服務流程管理-暫停結案-CRUD
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-status-history-route.js
 * Project: @erpv3/backend
 * File Created: 2022-10-04 10:37:00 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const Router = require('@koa/router');
const { CaseStatusHistoryController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/caseStatusHistories')
  .get('/', CaseStatusHistoryController.readList)
  .post('/', CaseStatusHistoryController.create)
  .patch('/:caseStatusHistoryId', CaseStatusHistoryController.update)
  .delete('/:caseStatusHistoryId', CaseStatusHistoryController.delete);

module.exports = _router;
