/**
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-預設菜色
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: dish-route.js
 * Project: @erpv3/backend
 * File Created: 2023-05-03 03:10:06 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const Router = require('@koa/router');
const { DishController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/dishes')
  .post('/init', DishController.init);

module.exports = _router;
