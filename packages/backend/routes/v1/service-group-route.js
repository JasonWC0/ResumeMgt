/**
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設功能(新增服務)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設功能(編輯服務)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設功能(檢視服務)
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: service-group-route.js
 * Project: @erpv3/backend
 * File Created: 2022-04-01 03:11:44 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { ServiceGroupController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/serviceGroups')
  .get('/', ServiceGroupController.readList)
  .get('/:serviceGroupId', ServiceGroupController.read)
  .patch('/:serviceGroupId', ServiceGroupController.update)
  .post('/', ServiceGroupController.create);

module.exports = _router;
