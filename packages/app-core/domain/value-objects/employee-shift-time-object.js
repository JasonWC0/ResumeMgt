/**
 * FeaturePath: Common-Entity--排班時間物件
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { ObjectId } = require('mongoose').Types;
const coreErrorCodes = require('../enums/error-codes');

/**
 * @class
 * @classdesc Represents contact object
 */
class EmployeeShiftTimeObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} id
     * @description 識別ID
     * @member
     */
    this.id = null;
    /**
     * @type {string} startDate
     * @description 起始時間
     * @member
     */
    this.startDate = null;
    /**
     * @type {string} endDate
     * @description 結束時間
     * @member
     */
    this.endDate = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .checkThrows(this.id,
        { fn: (val) => ObjectId.isValid(val), m: coreErrorCodes.ERR_OBJECT_ID_WRONG_FORMAT })
      .checkThrows(this.shiftDate,
        { s: CustomValidator.strategies.IS_ISODATE, m: coreErrorCodes.ERR_EMPLOYEE_SHIFT_DATE_WRONG_FORMAT })
      .checkThrows(this.endDate,
        { s: CustomValidator.strategies.IS_ISODATE, m: coreErrorCodes.ERR_EMPLOYEE_SHIFT_DATE_WRONG_FORMAT });
  }

  /**
  * @method
  * @description Return formated info
  * @returns {Object}
  */
  toView() {
    return {
      id: this.id,
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }
}

module.exports = EmployeeShiftTimeObject;
