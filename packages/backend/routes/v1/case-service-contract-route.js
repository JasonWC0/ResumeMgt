/**
 * FeaturePath: 經營管理-合約管理-個案合約-新讀刪修
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-service-contract-route.js
 * Project: @erpv3/backend
 * File Created: 2022-12-02 12:00:46 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { CaseServiceContractController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/caseServiceContracts')
  .get('/', CaseServiceContractController.readList)
  .get('/:caseServiceContractId', CaseServiceContractController.read)
  .post('/', CaseServiceContractController.create)
  .patch('/:caseServiceContractId', CaseServiceContractController.update)
  .delete('/:caseServiceContractId', CaseServiceContractController.delete);

module.exports = _router;
