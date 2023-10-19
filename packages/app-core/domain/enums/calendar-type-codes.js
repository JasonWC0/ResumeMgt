/**
 * FeaturePath: Common-Enum--假日行事曆類別
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: calendar-type-codes.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-18 05:58:26 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const _holidayTypeCodes = {
  normal: 0, // 正常班
  mandatoryDayOff: 1, // 例假日班
  flexibleRestDay: 2, // 休假日
  nationalHoliday: 3, // 國定假日
};

const _calendarTypeCodes = {
  ..._holidayTypeCodes,
  event: 4, // 自訂事項
};

module.exports = {
  HolidayTypeCodes: _holidayTypeCodes,
  CalendarTypeCodes: _calendarTypeCodes,
};
