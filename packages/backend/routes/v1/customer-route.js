/**
 * FeaturePath: 個案管理-基本資料-個案資訊-新增顧客資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-編輯顧客資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-查詢顧客資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-刪除顧客資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-查詢顧客清單
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const Router = require('@koa/router');
const coreV1Ctrls = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/customers')
  .post('/:personId', coreV1Ctrls.CustomerController.createCustomer)
  .patch('/:personId', coreV1Ctrls.CustomerController.updateCustomer)
  .get('/:personId', coreV1Ctrls.CustomerController.readCustomer)
  .delete('/:personId', coreV1Ctrls.CustomerController.deleteCustomer)
  .get('/', coreV1Ctrls.CustomerController.listCustomer);
module.exports = _router;
