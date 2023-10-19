/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: read-nursing-shift-schedule-list-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-25 11:37:14 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models } = require('@erpv3/app-common');
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class ReadNursingShiftScheduleRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} year
     * @description 年
     * @member
     */
    this.year = '';
    /**
     * @type {string} month
     * @description 月
     * @member
     */
    this.month = '';
    /**
     * @type {array} dates
     * @description 日期
     * @member
     */
    this.dates = [];
    /**
     * @type {string} personId
     * @description 人員Id
     * @member
     */
    this.personId = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    this.year = data.y;
    this.month = data.m;
    this.dates = data.dates ? data.dates.split(',') : [];
    return this;
  }

  toNumber() {
    this.year = Number.isNaN(Number(this.year)) ? null : Number(this.year);
    this.month = Number.isNaN(Number(this.month)) ? null : Number(this.month);
    return this;
  }

  checkRequired() {
    if (CustomValidator.nonEmptyString(this.year) && CustomValidator.nonEmptyString(this.month)) {
      new CustomValidator()
        .checkThrows(this.year,
          { fn: (val) => CustomRegex.yearFormat(val), m: coreErrorCodes.ERR_YEAR_WRONG_FORMAT })
        .checkThrows(this.month,
          { fn: (val) => CustomRegex.monthFormat((val < 10 ? '0' : '') + val), m: coreErrorCodes.ERR_MONTH_WRONG_FORMAT });
    } else if (CustomValidator.nonEmptyArray(this.dates)) {
      this.dates.forEach((date) => {
        new CustomValidator()
          .checkThrows(date,
            { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_DATE_WRONG_FORMAT });
      });
    } else {
      throw new models.CustomError(coreErrorCodes.ERR_QUERY_TIME_IS_EMPTY);
    }

    return this;
  }
}

module.exports = ReadNursingShiftScheduleRequest;
