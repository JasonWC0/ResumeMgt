/**
 * FeaturePath: 經營管理-人事管理-員工差勤-請假紀錄CRUD
 * FeaturePath: 經營管理-人事管理-員工差勤-請假Quota
 * FeaturePath: 經營管理-人事管理-員工差勤-計算請假時數
 * FeaturePath: 經營管理-人事管理-員工差勤-機構假別RU
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const Router = require('@koa/router');
const coreV1Ctrls = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/leaves')
  .post('/employee', coreV1Ctrls.EmployeeLeaveController.create)
  .patch('/:leaveId', coreV1Ctrls.EmployeeLeaveController.update)
  .get('/employeeQuota', coreV1Ctrls.EmployeeLeaveController.readEmployeeQuota)
  .get('/history', coreV1Ctrls.EmployeeLeaveController.listHistory)
  .get('/c/settingHours', coreV1Ctrls.LeaveTypeController.read)
  .patch('/c/settingHours', coreV1Ctrls.LeaveTypeController.update)
  .post('/:leaveId/cancel', coreV1Ctrls.EmployeeLeaveController.cancelLeave)
  .delete('/:leaveId', coreV1Ctrls.EmployeeLeaveController.delete)
  .post('/leaveHours', coreV1Ctrls.EmployeeLeaveController.countLeaveHours);

module.exports = _router;
