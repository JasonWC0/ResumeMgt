/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: care-plan-route.js
 * Project: @erpv3/backend
 * File Created: 2022-08-03 02:25:10 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { CarePlanController } = require('../../controllers/migration');

const _router = new Router();
_router.prefix('/carePlans')
  .post('/n', CarePlanController.create)
  .patch('/n/:carePlanId', CarePlanController.updateNewest);

module.exports = _router;
