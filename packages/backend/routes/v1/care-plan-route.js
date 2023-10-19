/**
 * FeaturePath: 個案管理-計畫-照顧計畫-新增照顧計畫
 * FeaturePath: 個案管理-計畫-照顧計畫-編輯歷史照顧計畫
 * FeaturePath: 個案管理-計畫-照顧計畫-編輯最新照顧計畫
 * FeaturePath: 個案管理-計畫-照顧計畫-檢視照顧計畫
 * FeaturePath: 個案管理-計畫-照顧計畫-刪除歷史照顧計畫
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: care-plan-route.js
 * Project: @erpv3/backend
 * File Created: 2022-06-06 06:36:40 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { CarePlanController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/carePlans')
  .get('/n', CarePlanController.readNewest)
  .get('/h', CarePlanController.readHistoryList)
  .post('/n', CarePlanController.create)
  .patch('/n/:carePlanId', CarePlanController.updateNewest)
  .patch('/h/:carePlanId', CarePlanController.updateHistory)
  .delete('/h/:carePlanId', CarePlanController.delete);

module.exports = _router;
