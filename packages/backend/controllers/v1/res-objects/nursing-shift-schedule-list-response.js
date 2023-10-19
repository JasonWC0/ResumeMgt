/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: nursing-shift-schedule-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-10-25 03:27:31 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');

class NursingShiftScheduleListResponse {
  constructor() {
    /**
    * @type {Array<NursingShiftScheduleEntity>}
    */
    this.list = [];
  }

  toView() {
    const dates = [];
    const personIds = [];
    this.list.forEach((d) => {
      if (!dates.includes(d.date.getTime())) { dates.push(d.date.getTime()); }
      if (!personIds.includes(d.personId)) { personIds.push(d.personId); }
    });

    const resArray = [];
    for (const _date of dates) {
      for (const _p of personIds) {
        const data = this.list.filter((l) => l.date.getTime() === _date && l.personId === _p);
        if (data.length === 0) { continue; }

        const setDate = new Date(_date);
        const obj = {
          date: setDate,
          personId: _p,
        };

        const shiftScheduleList = [];
        for (const d of data) {
          const eLeaveObjs = [];
          if (d.employeeLeaveHistoryIds && d.employeeLeaveHistoryIds.length > 0) {
            d.employeeLeaveHistoryIds.forEach((empLeaveHistory) => {
              const detail = empLeaveHistory?.obj?.leaveDetail[moment(setDate).format('YYYY/MM/DD')] || null;

              eLeaveObjs.push({
                id: empLeaveHistory?.employeeLeaveHistoryId || '',
                leaveType: empLeaveHistory?.obj?.leaveType || null,
                startTime: detail ? detail.startTime : '',
                endTime: detail ? detail.endTime : '',
              });
            });
          }

          const shiftSchedule = {
            id: d.id,
            nursingShiftId: d?.nursingShift?.nursingShiftId || '',
            nursingShiftCode: d?.nursingShift?.code || '',
            nursingShiftStartedAt: d?.nursingShift?.startedAt || '',
            nursingShiftEndedAt: d?.nursingShift?.endedAt || '',
            employeeLeaveHistoryList: eLeaveObjs,
            vn: d.__vn,
          };
          shiftScheduleList.push(shiftSchedule);
        }
        obj.shiftSchedules = shiftScheduleList;
        if (shiftScheduleList.length > 0) {
          resArray.push(obj);
        }
      }
    }
    return resArray;
  }
}

module.exports = NursingShiftScheduleListResponse;
