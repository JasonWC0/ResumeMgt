/**
 * FeaturePath: 經營管理-評鑑管理-逐案分析-編輯公司日照評鑑表單範本列表
 * FeaturePath: 經營管理-評鑑管理-逐案分析-檢視公司日照評鑑表單範本列表
 * FeaturePath: 個案管理-評估-評估管理-編輯公司評估表單範本列表
 * FeaturePath: 個案管理-評估-評估管理-檢視公司評估表單範本列表
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-route.js
 * Project: @erpv3/backend
 * File Created: 2022-03-08 10:35:15 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { FormController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/forms')
  .get('/', FormController.readList)
  .get('/:formId', FormController.read)
  .patch('/:formId', FormController.update);

module.exports = _router;
