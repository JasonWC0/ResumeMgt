/**
 * FeaturePath: 經營管理-評鑑管理-逐案分析-新增日照評鑑表單
 * FeaturePath: 經營管理-評鑑管理-逐案分析-檢視日照評鑑表單
 * FeaturePath: 經營管理-評鑑管理-逐案分析-編輯日照評鑑表單
 * FeaturePath: 經營管理-評鑑管理-逐案分析-刪除日照評鑑表單
 * FeaturePath: 個案管理-評估-評估管理-新增評估表單
 * FeaturePath: 個案管理-評估-評估管理-編輯評估表單
 * FeaturePath: 個案管理-評估-評估管理-檢視評估表單
 * FeaturePath: 個案管理-評估-評估管理-刪除評估表單
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-result-route.js
 * Project: @erpv3/backend
 * File Created: 2022-03-15 01:35:50 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { FormResultController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/formResults')
  .get('/:category', FormResultController.readList)
  .get('/:category/:formResultId', FormResultController.read)
  .post('/:category', FormResultController.create)
  .patch('/:category/:formResultId', FormResultController.update)
  .delete('/:category/:formResultId', FormResultController.delete)
  .post('/:category/deleteMulti', FormResultController.deleteList)
  .get('/all/gByCase/newestList', FormResultController.readNewestGroupByCase);

module.exports = _router;
