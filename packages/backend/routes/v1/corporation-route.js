/**
 * FeaturePath: 經營管理-系統管理-機構服務設定-新增集團總公司基本資料
 * FeaturePath: 經營管理-系統管理-機構服務設定-編輯集團總公司基本資料
 * FeaturePath: 經營管理-系統管理-機構服務設定-檢視集團總公司基本資料
 * FeaturePath: 經營管理-系統管理-機構服務設定-刪除集團總公司基本資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: company-route.js
 * Project: @erpv3/backend
 * File Created: 2022-02-10 03:46:52 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { CorporationController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/corporations')
  .post('/', CorporationController.create)
  .get('/:corpId', CorporationController.read)
  .patch('/:corpId', CorporationController.update)
  .delete('/:corpId', CorporationController.delete);

module.exports = _router;
