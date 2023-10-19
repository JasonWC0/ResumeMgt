/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const {
  coreErrorCodes,
  employeeShiftTypeCodes,
} = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class ReadEmployeeAttendanceRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {Number} scheduleType
     * @description 班表類型
     * @member
     */
    this.scheduleType = null;
    /**
     * @type {Date} shiftDate
     * @description 班表起始日
     * @member
     */
    this.shiftDate = null;
    /**
     * @type {Boolean} incumbent
     * @description 是否在職
     * @member
     */
    this.incumbent = null;
    /**
     * @type {Number} skip
     * @description 略過數量
     * @member
     */
    this.skip = 0;
    /**
    * @type {Number} limit
    * @description 查詢數量
    * @member
    */
    this.limit = 50;
  }

  bind(data) {
    super.bind(data, this);
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
    return this;
  }
}

module.exports = ReadEmployeeAttendanceRequest;
