/**
 * FeaturePath: 經營管理-財會-個案帳務管理-個案關帳管理
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-close-account-route.js
 * Project: @erpv3/backend
 * File Created: 2022-12-04 09:22:25 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const Router = require('@koa/router');
const { CaseCloseAccountController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/caseCloseAccounts')
  .get('/', CaseCloseAccountController.readList)
  .post('/multi', CaseCloseAccountController.updateSettings);

module.exports = _router;
