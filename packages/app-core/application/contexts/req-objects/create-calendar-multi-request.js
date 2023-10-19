/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-calendar-multi-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-25 10:40:53 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, calendarTypeCodes, dayOfWeekCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class CreateCalendarMultiRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} companyId
     * @description 公司Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} startDate
     * @description 開始日期
     * @member
     */
    this.startDate = '';
    /**
     * @type {string} endDate
     * @description 結束日期
     * @member
     */
    this.endDate = '';
    /**
     * @type {number} dayOfTheWeek
     * @description 星期幾
     * @member
     */
    this.dayOfTheWeek = null;
    /**
     * @type {string} type
     * @description 分類
     * @member
     */
    this.type = '';
    /**
     * @type {string} note
     * @description 備註/內容
     * @member
     */
    this.note = '';
    /**
     * @type {boolean} overWrite
     * @description 是否覆蓋既有假日行事曆
     * @member
     */
    this.overWrite = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .checkThrows(this.startDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_START_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT })
      .checkThrows(this.endDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_END_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT })
      .checkThrows(this.dayOfTheWeek,
        { fn: (val) => Object.values(dayOfWeekCodes).includes(val), m: coreErrorCodes.ERR_DAY_OF_WEEK_NOT_EXIST })
      .checkThrows(this.type,
        { fn: (val) => Object.values(calendarTypeCodes.HolidayTypeCodes).includes(val), m: coreErrorCodes.ERR_HOLIDAY_TYPE_NOT_EXIST },
        { fn: (val) => !CustomValidator.isEqual(val, calendarTypeCodes.HolidayTypeCodes.nationalHoliday), m: coreErrorCodes.ERR_NATIONAL_HOLIDAY_CANNOT_EDIT })
      .checkThrows(this.overWrite,
        { s: CustomValidator.strategies.IS_BOOL, m: coreErrorCodes.ERR_HOLIDAY_OVER_WRITE_WRONG_FORMAT });
    return this;
  }
}

module.exports = CreateCalendarMultiRequest;
