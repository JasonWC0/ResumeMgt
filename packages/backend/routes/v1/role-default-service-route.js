/**
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設角色(新增員工角色)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設角色(編輯員工角色)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設角色(檢視員工角色)
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: role-default-service-route.js
 * Project: @erpv3/backend
 * File Created: 2022-04-12 10:11:16 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { RoleDefaultServiceController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/roleDefaultServices')
  .post('/', RoleDefaultServiceController.create)
  .get('/', RoleDefaultServiceController.readList)
  .get('/:roleDefaultServiceId', RoleDefaultServiceController.read)
  .patch('/:roleDefaultServiceId', RoleDefaultServiceController.update);

module.exports = _router;
