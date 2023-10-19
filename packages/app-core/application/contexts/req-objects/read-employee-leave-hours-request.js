/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { coreErrorCodes } = require('../../../domain');

/**
* @class
* @classdesc inherit UpdateReviewRequest
*/
class ReadEmployeeLeaveHoursRequest extends BaseBundle {
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
    new CustomValidator()
      .nonEmptyStringThrows(this.personId, coreErrorCodes.ERR_PERSON_ID_IS_EMPTY)
      .nonEmptyStringThrows(this.startDate, coreErrorCodes.ERR_START_DATE_IS_EMPTY)
      .nonEmptyStringThrows(this.endDate, coreErrorCodes.ERR_END_DATE_IS_EMPTY)
      .checkThrows(this.startDate,
        { m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT, s: CustomValidator.strategies.IS_ISODATE })
      .checkThrows(this.endDate,
        { m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT, s: CustomValidator.strategies.IS_ISODATE });

    return this;
  }
}

module.exports = ReadEmployeeLeaveHoursRequest;
