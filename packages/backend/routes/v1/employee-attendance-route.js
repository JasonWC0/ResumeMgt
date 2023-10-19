/**
 * FeaturePath: 經營管理-人事管理-員工差勤-打卡記錄標頭R
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const Router = require('@koa/router');
const coreV1Ctrls = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/attendances')
  .get('/title', coreV1Ctrls.EmployeeAttendanceController.readEmployeeAttendanceTitle);

module.exports = _router;
