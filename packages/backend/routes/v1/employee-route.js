/**
 * FeaturePath: 經營管理-人事管理-員工資料-新增員工資料
 * FeaturePath: 經營管理-人事管理-員工資料-編輯員工資料
 * FeaturePath: 經營管理-人事管理-員工資料-檢視員工資料
 * FeaturePath: 經營管理-人事管理-員工資料-刪除員工資料
 * FeaturePath: 經營管理-人事管理-員工資料-檢視員工資料(數據同步使用)
 * FeaturePath: 經營管理-人事管理-員工資料-編輯職務歷史紀錄
 * FeaturePath: 經營管理-人事管理-員工資料-檢視公司員工清單
 * FeaturePath: 經營管理-人事管理-員工資料-職務異動
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
_router.prefix('/employees')
  .post('/:personId', coreV1Ctrls.EmployeeController.createEmployee)
  .post('/:personId/personnelChange', coreV1Ctrls.EmployeeController.personnelChange)
  .get('/', coreV1Ctrls.EmployeeController.listEmployeeByCompany)
  .get('/:personId', coreV1Ctrls.EmployeeController.readEmployee)
  .get('/:personId/shiftSchedule', coreV1Ctrls.EmployeeController.GetShiftSchedule)
  .patch('/:personId', coreV1Ctrls.EmployeeController.updateEmployee)
  .patch('/s/:personId', coreV1Ctrls.EmployeeController.updateEmployeeForSync)
  .delete('/:personId', coreV1Ctrls.EmployeeController.deleteEmployee);

module.exports = _router;
