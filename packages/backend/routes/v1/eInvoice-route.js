/**
 * FeaturePath: 經營管理-財會-個案帳務管理-電子發票
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: eInvoice-route.js
 * Project: @erpv3/backend
 * File Created: 2023-03-07 03:16:29 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const Router = require('@koa/router');
const { EInvoiceController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/eInvoices')
  .get('/', EInvoiceController.readEInvoiceList)
  .post('/', EInvoiceController.createEInvoice)
  .patch('/:eInvoiceId', EInvoiceController.updateEInvoice)
  .post('/:eInvoiceId/issue', EInvoiceController.issue);

module.exports = _router;
