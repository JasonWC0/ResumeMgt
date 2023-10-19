/**
 * FeaturePath: 經營管理-人事管理-員工資料-職務異動歷史紀錄更新
 * FeaturePath: 經營管理-人事管理-員工資料-查詢職務異動歷史紀錄清單
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
_router.prefix('/employmentHistories')
  .patch('/:employmentHistoryId', coreV1Ctrls.EmploymentHistoryController.update)
  .get('/', coreV1Ctrls.EmploymentHistoryController.readByPersonId);

module.exports = _router;
