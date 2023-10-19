/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const {
  coreErrorCodes,
  employeeShiftTypeCodes,
  EmployeeShiftTimeObject,
} = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class UpdateEmployeeAttendanceRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {String} personId
     * @description 人員ID
     * @member
     */
    this.personId = null;
    /**
     * @type {Date} date
     * @description 班表日期
     * @member
     */
    this.date = null;
    /**
     * @type {Number} salarySystem
     * @description 薪制
     * @member
     */
    this.salarySystem = null;
    /**
     * @type {Date} punchIn
     * @description 上班打卡時間
     * @member
     */
    this.punchIn = null;
    /**
    * @type {Date} punchOut
    * @description 下班打卡時間
    * @member
    */
    this.punchOut = null;
    /**
    * @type {Date} lunchBreakStart
    * @description 午休開始時間
    * @member
    */
    this.lunchBreakStart = null;
    /**
    * @type {Date} lunchBreakEnd
    * @description 午休結束時間
    * @member
    */
    this.lunchBreakEnd = null;
    /**
    * @type {Array<EmployeeShiftTimeObject>} caseService
    * @description 個案服務排班時間
    * @member
    */
    this.caseService = [];
    /**
    * @type {Array<EmployeeShiftTimeObject>} nurseShift
    * @description 護理排班時間
    * @member
    */
    this.nurseShift = [];
  }

  bind(data) {
    super.bind(data, this);
    if (CustomValidator.nonEmptyArray(data.caseService)) {
      this.caseService = data.caseService.map((c) => new EmployeeShiftTimeObject().bind(c));
    }
    if (CustomValidator.nonEmptyArray(data.nurseShift)) {
      this.nurseShift = data.nurseShift.map((n) => new EmployeeShiftTimeObject().bind(n));
    }
    return this;
  }

  checkRequired() {
    new CustomValidator().checkThrows(this.shiftDate, { s: CustomValidator.strategies.IS_DATE, m: coreErrorCodes.ERR_EMPLOYEE_SHIFT_DATE_WRONG_FORMAT });
    if (this.scheduleType) {
      new CustomValidator()
        .checkThrows(this.scheduleType,
          { fn: (val) => !Number.isNaN(Number(val)), m: coreErrorCodes.ERR_EMPLOYEE_SHIFT_TYPE_WRONG_VALUE })
        .checkThrows(this.scheduleType, {
          m: coreErrorCodes.ERR_EMPLOYEE_SHIFT_TYPE_WRONG_VALUE,
          fn: (val) => Object.values(employeeShiftTypeCodes).includes(val),
        });
    }
    if (this.skip) {
      new CustomValidator().checkThrows(this.skip,
        { fn: (val) => !Number.isNaN(Number(val)), m: coreErrorCodes.ERR_SKIP_WRONG_FORMAT });
      this.skip = parseInt(this.skip, 10);
    }
    if (this.limit) {
      new CustomValidator().checkThrows(this.limit,
        { fn: (val) => !Number.isNaN(Number(val)), m: coreErrorCodes.ERR_LIMIT_WRONG_FORMAT });
      this.limit = parseInt(this.limit, 10);
    }
    this.caseService.forEach((c) => c.checkRequired());
    this.nurseShift.forEach((n) => n.checkRequired());
    return this;
  }
}

module.exports = UpdateEmployeeAttendanceRequest;
