/**
 * FeaturePath: 個案管理-計畫-用藥計畫-CRUD
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-plan-route.js
 * Project: @erpv3/backend
 * File Created: 2022-08-16 05:10:36 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { MedicinePlanController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/medicinePlans')
  .post('/', MedicinePlanController.create)
  .patch('/:medicinePlanId', MedicinePlanController.update)
  .get('/', MedicinePlanController.readList)
  .get('/:medicinePlanId', MedicinePlanController.read)
  .delete('/:medicinePlanId', MedicinePlanController.delete);

module.exports = _router;
