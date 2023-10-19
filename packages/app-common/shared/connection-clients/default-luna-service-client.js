/**
 * FeaturePath: 通用主系統-通用子系統-連線模組-ERPv25
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: default-luna-service-client.js
 * Project: @erpv3/app-common
 * File Created: 2022-08-17 01:51:36 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const fetch = require('node-fetch');
// const { URL, URLSearchParams } = require('url');

const LUNA_API = {
  // 日照-個案-取得排班列表
  ReadDaycaseSchedule: {
    key: 'ReadDaycaseSchedule',
    method: 'POST',
    uri: '/daycaseSchedule/list',
  },
  // 居服-個案結案-刪除排班
  DeleteCaseScheduleByClosed: {
    key: 'DeleteCaseScheduleByClosed',
    method: 'POST',
    uri: '/case/deleteShiftsOfClosureCase',
  },
  // 居服-個案暫停-刪除排班(無結束日期)
  DeleteCaseScheduleByPending: {
    key: 'DeleteCaseScheduleByPending',
    method: 'POST',
    uri: '/case/deleteShiftsOfPendingCase',
  },
  // 居服-個案暫停-刪除排班(有結束日期)
  DeleteCaseScheduleByPendingRange: {
    key: 'DeleteCaseScheduleByPendingRange',
    method: 'POST',
    uri: '/shift/deleteShiftsByPeriod',
  },
  // 居服-個案暫停-請假
  SetCaseScheduleLeaveByPendingRange: {
    key: 'SetCaseScheduleLeaveByPendingRange',
    method: 'POST',
    uri: '/case/leaveShiftsOfPendingCase',
  },
  // 居服-個案恢復服務-銷假
  SetCaseScheduleCancelLeaveByPendingRange: {
    key: 'SetCaseScheduleCancelLeaveByPendingRange',
    method: 'POST',
    uri: '/case/cancelLeaveShift',
  },
  // 日照-個案結案-刪除排班
  DeleteDaycaseScheduleByClosed: {
    key: 'DeleteDaycaseScheduleByClosed',
    method: 'POST',
    uri: '/daycase/deleteScheduleOfClosureCase',
  },
  // 日照-個案暫停-刪除排班(有結束日期)
  DeleteDaycaseScheduleByPending: {
    key: 'DeleteDaycaseScheduleByPending',
    method: 'POST',
    uri: '/daycase/deleteScheduleOfPendingCase',
  },
  // 日照-個案暫停-請假
  SetDaycaseScheduleLeaveByPendingRange: {
    key: 'SetDaycaseScheduleLeaveByPendingRange',
    method: 'POST',
    uri: '/daycase/leaveScheduleOfPendingCase',
  },
  // 日照-個案恢復服務-銷假
  SetDaycaseScheduleCancelLeaveByPendingRange: {
    key: 'SetDaycaseScheduleCancelLeaveByPendingRange',
    method: 'POST',
    uri: '/daycase/cancelLeaveSchedule',
  },
  // 居服-查詢區間服務紀錄筆數
  ReadCaseServiceRecordCount: {
    key: 'ReadCaseServiceRecordCount',
    method: 'POST',
    uri: '/serviceRecord/getServiceRecordCount',
  },
  // 日照-查詢區間服務紀錄筆數
  ReadDaycaseServiceRecordCount: {
    key: 'ReadDaycaseServiceRecordCount',
    method: 'POST',
    uri: '/punchRecord/getPunchRecordCount',
  },
  ReadHomecareScheduleByEmployee: {
    key: 'ReadHomecareScheduleByEmployee',
    method: 'POST',
    uri: '/shift/profile/v2',
  },
  ReadDaycareAndDriverScheduleByEmployee: {
    key: 'ReadDaycareAndDriverScheduleByEmployee',
    method: 'POST',
    uri: '/daycaseSchedule/getScheduleItemByEmployee',
  },
  ReadHomecareLeaveRecordByEmployee: {
    key: 'ReadHomecareLeaveRecordByEmployee',
    method: 'POST',
    uri: '/employee/leave/records',
  },
  ReadDaycareAndDriverLeaveRecordByEmployee: {
    key: 'ReadDaycareAndDriverLeaveRecordByEmployee',
    method: 'POST',
    uri: '/employee/leave/dayCare/list',
  },
  CreateHomecareShiftLeave: {
    key: 'CreateHomecareShiftLeave',
    method: 'POST',
    uri: '/shift/actionMulti',
  },
  CreateDaycareAndDriverShiftLeave: {
    key: 'CreateDaycareAndDriverShiftLeave',
    method: 'POST',
    uri: '/employee/leave/dayCare/upsert',
  },
  CancelEmployeeHCLeave: {
    key: 'CancelEmployeeHCLeave',
    method: 'POST',
    uri: '/shift/boss',
  },
  CancelEmployeeDaycareAndDriverLeave: {
    key: 'CancelEmployeeDaycareAndDriverLeave',
    method: 'POST',
    uri: '/employee/leave/dayCare/upsert',
  },
  ReadCaseCloseAccountSettings: {
    key: 'ReadCaseCloseAccountSettings',
    method: 'POST',
    uri: '/caseCloseAccount/list',
  },
  SetCaseCloseAccountSettings: {
    key: 'SetCaseCloseAccountSettings',
    method: 'POST',
    uri: '/caseCloseAccount/update',
  },
  // 新增表單結果
  CreateFormResult: {
    key: 'CreateFormResult',
    method: 'POST',
    uri: '/form/createResult',
  },
  // 查詢個案表單結果列表
  ReadFromResultList: {
    key: 'ReadFromResultList',
    method: 'POST',
    uri: '/form/queryResult',
  },
  // 查詢機構表單範本(指定code)
  ReadFormProfile: {
    key: 'ReadFormProfile',
    method: 'POST',
    uri: '/form/profile',
  },
  // 居服-查詢個案
  ReadCaseProfile: {
    key: 'ReadCaseProfile',
    method: 'POST',
    uri: '/case/profile',
  },
  // 日照-查詢個案
  ReadDaycaseProfile: {
    key: 'ReadDaycaseProfile',
    method: 'POST',
    uri: '/daycase/profile',
  },
  // 查詢個案列表(使用於個案合約)
  ReadContractCaseList: {
    key: 'ReadContractCaseList',
    method: 'POST',
    uri: '/case/contract/caseList',
  },
};

class LunaServiceClass {
  static async normalAPI(host, key, cookie, params, api, setSPHeader = true) {
    if (!Object.keys(LUNA_API).includes(api)) { throw new Error('This api not support.'); }

    const { companyId } = params;
    const { uri, method } = LUNA_API[api];
    const url = `${host}${uri}`;
    const headers = {
      'Content-Type': 'application/json',
      cookie,
    };
    if (setSPHeader) { headers[key] = `v=3;c=${companyId}`; }
    const body = JSON.stringify(params);
    try {
      const response = await fetch(url, { method, headers, body });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (ex) {
      throw new Error(`Call ERP2.5 [${api}] fail`);
    }
  }

  static async setFromWebAPI(host, key, cookie, params, api) {
    if (!Object.keys(LUNA_API).includes(api)) { throw new Error('This api not support.'); }

    const { companyId } = params;
    const { uri, method } = LUNA_API[api];
    const url = `${host}${uri}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-request-from': 'web',
      cookie,
    };
    headers[key] = `v=3;c=${companyId}`;
    const body = JSON.stringify(params);
    try {
      const response = await fetch(url, { method, headers, body });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (ex) {
      throw new Error(`Call ERP2.5 [${api}] fail`);
    }
  }

  static async useAPIKeyAPI(host, apiKey, params, api) {
    if (!Object.keys(LUNA_API).includes(api)) { throw new Error('This api not support.'); }

    const { uri, method } = LUNA_API[api];
    const url = `${host}${uri}`;
    const headers = {
      'Content-Type': 'application/json',
    };
    headers['api-key'] = apiKey;
    const body = JSON.stringify(params);
    try {
      const response = await fetch(url, { method, headers, body });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (ex) {
      throw new Error(`Call ERP2.5 [${api}] fail`);
    }
  }
}

module.exports = { LunaServiceClass, LunaApi: LUNA_API };
