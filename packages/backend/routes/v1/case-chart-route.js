/**
 * FeaturePath: 個案管理-基本資料-家屬資訊-v3家系圖、生態圖暫存、儲存、列表
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
_router.prefix('/caseCharts')
  .post('/', coreV1Ctrls.CaseChartController.create)
  .patch('/:caseChartId', coreV1Ctrls.CaseChartController.update)
  .get('/', coreV1Ctrls.CaseChartController.listByCaseId)
  .delete('/:caseChartId', coreV1Ctrls.CaseChartController.delete);

module.exports = _router;
