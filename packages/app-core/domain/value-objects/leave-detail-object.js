/**
 * FeaturePath: Common-Entity--請假時間細節物件
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { BaseBundle } = require('@erpv3/app-common/custom-models');

/**
 * @class
 * @classdesc Represents leave detail object
 */
class LeaveDetailObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} startTime
     * @description 開始時間
     * @member
     */
    this.startTime = null;
    /**
     * @type {string} endTime
     * @description 結束時間
     * @member
     */
    this.endTime = null;
    /**
     * @type {Number} hours
     * @description 個人ID
     * @member
     */
    this.hours = 0;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
  * @method
  * @description Return formated info
  * @returns {Object}
  */
  responseInfo() {
    return {
      startDate: this.startDate,
      endDate: this.endDate,
      hours: this.hours,
    };
  }
}

module.exports = LeaveDetailObject;
