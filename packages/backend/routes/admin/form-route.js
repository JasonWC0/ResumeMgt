/**
 * FeaturePath: 經營管理-評鑑管理-逐案分析-新增公司日照評鑑表單範本列表
 * FeaturePath: 經營管理-評鑑管理-逐案分析-編輯公司日照評鑑表單範本列表
 * FeaturePath: 個案管理-評估-評估管理-新增公司評估表單範本列表
 * FeaturePath: 個案管理-評估-評估管理-編輯公司評估表單範本列表
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-route.js
 * Project: @erpv3/backend
 * File Created: 2022-05-10 06:41:13 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { FormController } = require('../../controllers/admin');

const _router = new Router();
_router.prefix('/forms')
  .post('/seeder', FormController.seeder);

module.exports = _router;
