/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: read-calendar-list-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-22 01:51:38 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, calendarTypeCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class ReadCalendarListRequest extends BaseBundle {
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
    * @type {string} year
    * @description 年份
    * @member
    */
    this.year = '';
    /**
    * @type {string} month
    * @description 月份
    * @member
    */
    this.month = '';
    /**
    * @type {string} order
    * @description 排列順序
    * @member
    */
    this.order = 'date';
  }

  bind(data) {
    super.bind(data, this);
    if (data.y) { this.year = Number(data.y); }
    if (data.m) { this.month = Number(data.m); }
    return this;
  }

  setType(category) {
    switch (category) {
      case 'holiday':
        this.type = Object.values(calendarTypeCodes.HolidayTypeCodes);
        break;
      case 'event':
        this.type = [calendarTypeCodes.CalendarTypeCodes.event];
        break;
      default:
        break;
    }
    return this;
  }

  setOrder() {
    if (CustomValidator.isEqual(this.order, 'date')) {
      this.order = { date: 1 };
    } else {
      this.order = { date: -1 };
    }
    return this;
  }

  checkRequired(category = null) {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .checkThrows(this.year,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_YEAR_IS_EMPTY },
        { fn: (val) => CustomRegex.yearFormat(val), m: coreErrorCodes.ERR_YEAR_WRONG_FORMAT });

    if (!category) {
      new CustomValidator()
        .checkThrows(this.month,
          { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_MONTH_IS_EMPTY },
          { fn: (val) => CustomRegex.monthFormat(val), m: coreErrorCodes.ERR_MONTH_WRONG_FORMAT });
    }
    return this;
  }
}

module.exports = ReadCalendarListRequest;
