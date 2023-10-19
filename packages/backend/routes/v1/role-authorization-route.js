/**
 * FeaturePath: 經營管理-系統管理-機構服務設定-新增員工角色權限設定
 * FeaturePath: 經營管理-系統管理-機構服務設定-複製員工角色權限設定
 * FeaturePath: 經營管理-系統管理-機構服務設定-編輯員工角色權限設定
 * FeaturePath: 經營管理-系統管理-機構服務設定-檢視員工角色權限設定
 * FeaturePath: 經營管理-系統管理-機構服務設定-刪除員工角色權限設定
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: role-authorization-route.js
 * Project: @erpv3/backend
 * File Created: 2022-04-18 04:58:44 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { RoleAuthorizationController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/roleAuthorizations')
  .post('/', RoleAuthorizationController.create)
  .post('/copy', RoleAuthorizationController.copy)
  .get('/:roleAuthorizationId', RoleAuthorizationController.read)
  .patch('/:roleAuthorizationId', RoleAuthorizationController.update)
  .delete('/:roleAuthorizationId', RoleAuthorizationController.delete);

module.exports = _router;
