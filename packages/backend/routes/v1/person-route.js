/**
 * FeaturePath: 經營管理-人事管理-員工資料-新增人員資料
 * FeaturePath: 經營管理-人事管理-員工資料-編輯人員資料
 * FeaturePath: 經營管理-人事管理-員工資料-查詢人員資料
 * FeaturePath: 經營管理-人事管理-員工資料-人員姓名模糊搜尋
 * FeaturePath: 經營管理-人事管理-員工資料-編輯人員資料(數據同步使用)
 * FeaturePath: 經營管理-人事管理-員工資料-刪除人員資料
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
_router.prefix('/persons')
  .post('/', coreV1Ctrls.PersonController.createPerson)
  .get('/c/fs', coreV1Ctrls.PersonController.fuzzySearchPerson)
  .get('/:personId', coreV1Ctrls.PersonController.readPerson)
  .patch('/:personId', coreV1Ctrls.PersonController.updatePerson)
  .patch('/s/:personId', coreV1Ctrls.PersonController.updatePersonForSync)
  .delete('/:personId', coreV1Ctrls.PersonController.deletePerson);

module.exports = _router;
