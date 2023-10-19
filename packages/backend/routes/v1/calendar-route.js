/**
 * FeaturePath: 經營管理-系統管理-機構服務設定-新增假日行事曆
 * FeaturePath: 經營管理-系統管理-機構服務設定-新增多筆假日行事曆
 * FeaturePath: 經營管理-系統管理-機構服務設定-編輯假日行事曆
 * FeaturePath: 經營管理-系統管理-機構服務設定-檢視假日行事曆
 * FeaturePath: 經營管理-系統管理-機構服務設定-刪除假日行事曆
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: calendar-route.js
 * Project: @erpv3/backend
 * File Created: 2022-07-25 02:55:57 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { CalendarController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/calendars')
  .post('/:category', CalendarController.create)
  .post('/holiday/multi', CalendarController.createMulti)
  .get('/:category', CalendarController.readList)
  .patch('/:category/:calendarId', CalendarController.update)
  .delete('/:category/:calendarId', CalendarController.delete);

module.exports = _router;
