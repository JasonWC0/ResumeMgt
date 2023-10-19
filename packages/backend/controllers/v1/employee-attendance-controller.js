/**
 * FeaturePath: 經營管理-人事管理-員工差勤-打卡記錄CRU
 * FeaturePath: 經營管理-人事管理-員工差勤-打卡記錄標頭R
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const moment = require('moment');
const { models } = require('@erpv3/app-common');
const {
  EmployeeLeaveHistoryRepository,
  EmployeeRepository,
} = require('@erpv3/app-core/infra/repositories');
const {
  employeeLeaveStatusCodes,
  salarySystemCodes,
} = require('@erpv3/app-core/domain');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('@erpv3/app-core/domain');
const reqObjects = require('@erpv3/app-core/application/contexts/req-objects');

class EmployeeAttendanceController {
  static async readEmployeeAttendance(ctx, next) {
    new reqObjects.ReadEmployeeAttendanceRequest()
      .bind(ctx.request.query)
      .checkRequired();

    // TODO: 取得日照、居服、司機班表

    // TODO: 組合班表資訊為回覆格式

    const res = { total: 0, list: [] };
    ctx.state.result = new models.CustomResult().withResult(res);
    await next();
  }

  static async updateEmployeeAttendance(ctx, next) {
    new reqObjects.UpdateEmployeeAttendanceRequest()
      .bind(ctx.request.query)
      .checkRequired();

    // TODO: 更新日照打卡時間

    // TODO: 更新居服打卡時間

    // TODO: 更新護理排班打卡時間

    ctx.state.result = new models.CustomResult().withResult();
    await next();
  }

  static async createEmployeeAttendanceBatchPunch(ctx, next) {
    new reqObjects.CreateEmployeeAttendanceBatchPunchRequest()
      .bind(ctx.request.query)
      .checkRequired();

    // TODO: 取得日照、居服、司機班表

    // TODO: 逐一補登班表

    ctx.state.result = new models.CustomResult().withResult();
    await next();
  }

  static async readEmployeeAttendanceTitle(ctx, next) {
    const { startDate, endDate } = ctx.request.query;
    const { companyId } = ctx.state.user;

    new CustomValidator()
      .nonEmptyStringThrows(startDate, coreErrorCodes.ERR_START_DATE_IS_EMPTY)
      .nonEmptyStringThrows(endDate, coreErrorCodes.ERR_END_DATE_IS_EMPTY)
      .checkThrows(startDate,
        { m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT, s: CustomValidator.strategies.IS_DATE })
      .checkThrows(endDate,
        { m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT, s: CustomValidator.strategies.IS_DATE });

    const dateList = {};
    const mStartDate = moment(startDate);
    const mEndDate = moment(endDate);
    const expectedEmployee = await EmployeeRepository.listByCompanyIdAndSalarySystem(companyId, salarySystemCodes.month);
    while (mStartDate.isSameOrBefore(mEndDate)) {
      dateList[mStartDate] = {
        expected: expectedEmployee.length,
        present: 0,
        absent: 0,
        leave: 0,
      };
      mStartDate.add(1, 'days');
    }
    // TODO: 取得日照、居服、司機打卡數

    const leaves = await EmployeeLeaveHistoryRepository.findList({
      companyId,
      startDate,
      endDate,
      status: employeeLeaveStatusCodes.done,
    });

    // Count leave number
    for (const l of leaves) {
      const lStartDate = moment(l.startDate);
      const lEndDate = moment(l.endDate);
      Object.entries(dateList).forEach((p) => {
        if (lStartDate.isSameOrBefore(moment(p[0])) && lEndDate.isSameOrAfter(moment(p[0]))) dateList[mStartDate] += 1;
      });
    }
    const res = [];
    ctx.state.result = new models.CustomResult().withResult(res);
    await next();
  }
}

module.exports = EmployeeAttendanceController;
