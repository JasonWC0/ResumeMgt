/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { BaseBundle, CustomError } = require('@erpv3/app-common/custom-models');
const {
  coreErrorCodes,
  salarySystemCodes,
  LeaveAgentObject,
  employeeLeaveTypeCodes,
} = require('../../../domain');

/**
* @class
* @classdesc inherit UpdateReviewRequest
*/
class CreateEmployeeLeaveRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
    * @type {string} personId
    * @description 個人ID
    * @member
    */
    this.personId = '';
    /**
    * @type {string} startDate
    * @description 請假起始時間
    * @member
    */
    this.startDate = '';
    /**
    * @type {string} endDate
    * @description 請假結束時間
    * @member
    */
    this.endDate = '';
    /**
    * @type {string} agent
    * @description 請假代理人
    * @member
    */
    this.leaveAgent = new LeaveAgentObject();
    /**
    * @type {Number} leaveType
    * @description 假別
    * @member
    */
    this.leaveType = null;
    /**
    * @type {string} memo
    * @description 事由
    * @member
    */
    this.memo = '';
    /**
    * @type {Number} salarySystem
    * @description 薪制
    * @member
    */
    this.salarySystem = null;
    /**
    * @type {Object} leaveDetail
    * @description 實際請假紀錄
    * @member
    */
    this.leaveDetail = null;
    /**
    * @type {Array<Object>} shiftList
    * @description 請假班表清單
    * @member
    */
    this.shiftList = [];
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  /**
  * @function
  * @description 資料確認
  */
  checkRequired() {
    if (this.salarySystem === null) throw new CustomError(coreErrorCodes.ERR_EMPLOYEE_SALARY_SYSTEM_EMPTY);
    if (this.leaveType === null) throw new CustomError(coreErrorCodes.ERR_EMPLOYEE_LEAVE_TYPE_IS_EMPTY);

    new CustomValidator()
      .nonEmptyStringThrows(this.personId, coreErrorCodes.ERR_PERSON_ID_IS_EMPTY)
      .checkThrows(this.salarySystem,
        { m: coreErrorCodes.ERR_EMPLOYEE_SALARY_SYSTEM_WRONG_VALUE, fn: (val) => Object.values(salarySystemCodes).includes(val) })
      .checkThrows(this.leaveType,
        { m: coreErrorCodes.ERR_EMPLOYEE_LEAVE_TYPE_WRONG_VALUE, fn: (val) => Object.values(employeeLeaveTypeCodes).includes(val) });

    if (this.salarySystem === salarySystemCodes.month) {
      new CustomValidator()
        .nonEmptyStringThrows(this.startDate, coreErrorCodes.ERR_START_DATE_IS_EMPTY)
        .nonEmptyStringThrows(this.endDate, coreErrorCodes.ERR_END_DATE_IS_EMPTY)
        .checkThrows(this.startDate,
          { m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT, s: CustomValidator.strategies.IS_ISODATE })
        .checkThrows(this.endDate,
          { m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT, s: CustomValidator.strategies.IS_ISODATE });
    } else if (this.salarySystem === salarySystemCodes.hour) {
      if (!CustomValidator.nonEmptyArray(this.shiftList)) {
        throw new CustomError(coreErrorCodes.ERR_LEAVE_SHIFT_LIST_IS_EMPTY);
      }
    }
    if (this.leaveDetail) {
      Object.entries(this.leaveDetail).forEach((pair) => {
        const [date, value] = pair;
        const { startTime, endTime, hours } = value;
        if (!startTime || !endTime || !hours) throw new CustomError(coreErrorCodes.ERR_LEAVE_DETAIL_WRONG_FORMAT);
        new CustomValidator()
          .checkThrows(date,
            { m: coreErrorCodes.ERR_LEAVE_DETAIL_DATE_WRONG_FORMAT, s: CustomValidator.strategies.IS_DATE })
          .checkThrows(hours,
            { m: coreErrorCodes.ERR_LEAVE_HOURS_WRONG_FORMAT, s: CustomValidator.strategies.IS_NUM })
          .checkThrows(startTime,
            { m: coreErrorCodes.ERR_LEAVE_DETAIL_START_DATE_WRONG_FORMAT, s: CustomValidator.strategies.IS_ISODATE })
          .checkThrows(endTime,
            { m: coreErrorCodes.ERR_LEAVE_DETAIL_END_DATE_WRONG_FORMAT, s: CustomValidator.strategies.IS_ISODATE });
      });
    }

    return this;
  }
}

module.exports = CreateEmployeeLeaveRequest;
