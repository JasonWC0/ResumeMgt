/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-calendar-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-19 06:03:55 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle, CustomError } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, calendarTypeCodes } = require('../../../domain');

const calendarCategory = {
  HOLIDAY: 'holiday',
  EVENT: 'event',
};

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class UpdateCalendarRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} date
     * @description 日期
     * @member
     */
    this.date = '';
    /**
     * @type {string} type
     * @description 分類
     * @member
     */
    this.type = '';
    /**
     * @type {string} time
     * @description 時間
     * @member
     */
    this.time = '';
    /**
    * @type {string} note
    * @description 備註/內容
    * @member
    */
    this.note = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired(category) {
    new CustomValidator()
      .checkThrows(this.date,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_CALENDAR_DATE_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_CALENDAR_DATE_WRONG_FORMAT });
    if (CustomValidator.isEqual(this.type, calendarTypeCodes.HolidayTypeCodes.nationalHoliday)) {
      throw new CustomError(coreErrorCodes.ERR_NATIONAL_HOLIDAY_CANNOT_EDIT);
    }

    switch (category) {
      case calendarCategory.HOLIDAY:
        new CustomValidator()
          .checkThrows(this.type,
            { fn: (val) => Object.values(calendarTypeCodes.HolidayTypeCodes).includes(val), m: coreErrorCodes.ERR_HOLIDAY_TYPE_NOT_EXIST });
        break;
      case calendarCategory.EVENT:
        new CustomValidator()
          .checkThrows(this.time,
            { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_CALENDAR_EVENT_TIME_EMPTY },
            { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_CALENDAR_EVENT_TIME_WRONG_FORMAT });
        break;
      default:
        throw new CustomError(coreErrorCodes.ERR_CALENDAR_CATEGORY_NOT_EXIST);
    }
    return this;
  }
}

module.exports = UpdateCalendarRequest;
