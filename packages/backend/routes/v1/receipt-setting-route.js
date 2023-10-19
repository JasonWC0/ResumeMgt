/**
 * FeaturePath: 仁寶平台管理-營運管理-機構參數設定-新增個案收據設定
 * FeaturePath: 仁寶平台管理-營運管理-機構參數設定-編輯個案收據設定
 * FeaturePath: 仁寶平台管理-營運管理-機構參數設定-條列個案收據設定
 * FeaturePath: 仁寶平台管理-營運管理-機構參數設定-刪除個案收據設定
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
_router.prefix('/receiptSettings')
  .get('/', coreV1Ctrls.ReceiptSettingController.listReceiptSetting)
  .post('/', coreV1Ctrls.ReceiptSettingController.createReceiptSetting)
  .patch('/:receiptSettingId', coreV1Ctrls.ReceiptSettingController.updateReceiptSetting)
  .delete('/:receiptSettingId', coreV1Ctrls.ReceiptSettingController.deleteReceiptSetting);

module.exports = _router;
