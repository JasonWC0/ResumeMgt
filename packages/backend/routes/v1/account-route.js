/**
 * FeaturePath: 經營管理-系統管理-帳號權限-登入
 * FeaturePath: 經營管理-系統管理-帳號權限-登出
 * FeaturePath: 經營管理-系統管理-帳號權限-新增帳號
 * FeaturePath: 經營管理-系統管理-帳號權限-檢視帳號
 * FeaturePath: 經營管理-系統管理-帳號權限-編輯帳號
 * FeaturePath: 經營管理-系統管理-帳號權限-刪除帳號
 * FeaturePath: 經營管理-系統管理-帳號權限-修改密碼
 * FeaturePath: 經營管理-系統管理-帳號權限-重設密碼
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: account-route.js
 * Project: @erpv3/backend
 * File Created: 2022-03-23 11:02:19 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { AccountController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/')
  .post('/login', AccountController.login)
  .post('/logout', AccountController.logout)
  .get('/accountInfo', AccountController.getInfo)
  .patch('/changePassword', AccountController.changePassword)
  .patch('/resetPassword', AccountController.resetPassword)
  .patch('/accounts/:account', AccountController.update)
  .patch('/accounts/:accountId/changePasswordById', AccountController.changePasswordById)
  .post('/accounts', AccountController.create)
  .delete('/accounts', AccountController.deleteList)
  .delete('/accounts/:account', AccountController.delete)
  .get('/accounts/checkExist', AccountController.checkExist)
  .patch('/token/extension', AccountController.tokenExtension);

module.exports = _router;
