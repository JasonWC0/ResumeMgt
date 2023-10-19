/**
 * FeaturePath: 仁寶平台管理-儲存服務-儲存物件-取得上傳檔案驗證碼
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
_router.prefix('/storages')
  .get('/t', coreV1Ctrls.StorageServiceController.generateToken);

module.exports = _router;
