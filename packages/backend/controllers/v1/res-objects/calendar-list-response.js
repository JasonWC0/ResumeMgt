/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: calendar-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-07-22 02:28:34 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { CalendarTypeCodes } = require('@erpv3/app-core/domain').calendarTypeCodes;

class CalendarListResponse {
  constructor() {
    /**
    * @type {Array<CalendarEntity>}
    */
    this.list = [];
  }

  toView() {
    const resArray = [];
    for (const c of this.list) {
      const obj = {
        id: c.id,
        date: c.date,
        type: c.type,
        note: c.note,
        vn: c.__vn,
      };
      if (c.type === CalendarTypeCodes.event) {
        obj.time = c.time;
      }
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = CalendarListResponse;
