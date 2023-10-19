/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const {
  coreErrorCodes,
  employeeLeaveStatusCodes,
} = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class ReadEmployeeLeaveHistoryListRequest extends BaseBundle {
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
    this.personId = null;
    /**
     * @type {string} startDate
     * @description 查詢開始日
     * @member
     */
    this.startDate = null;
    /**
    * @type {string} endDate
    * @description 查詢結束日
    * @member
    */
    this.endDate = null;
    /**
     * @type {Number} status
     * @description 請假狀態
     * @member
     */
    this.status = null;
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
    /**
     * @type {String} order
     * @description 排序
     * @member
     */
    this.order = '-createdAt';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    if (this.startDate) {
      new CustomValidator().checkThrows(this.startDate,
        { s: CustomValidator.strategies.IS_DATE, m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT });
    }

    if (this.endDate) {
      new CustomValidator().checkThrows(this.endDate,
        { s: CustomValidator.strategies.IS_DATE, m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT });
    }

    if (this.status) {
      new CustomValidator().checkThrows(this.status,
        { fn: (val) => !Number.isNaN(Number(val)), m: coreErrorCodes.ERR_LEAVE_STATUS_WRONG_VALUE });
      this.status = parseInt(this.status, 10);
      new CustomValidator().checkThrows(this.status, {
        m: coreErrorCodes.ERR_LEAVE_STATUS_WRONG_VALUE,
        fn: (val) => Object.values(employeeLeaveStatusCodes).includes(val),
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

module.exports = ReadEmployeeLeaveHistoryListRequest;
