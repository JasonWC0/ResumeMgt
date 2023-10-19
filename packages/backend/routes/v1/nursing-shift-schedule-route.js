/**
 * FeaturePath: 住宿式服務-排班-排班管理-排班CRUD
 * FeaturePath: 住宿式服務-排班-排班管理-複製排班
 * FeaturePath: 住宿式服務-排班-排班管理-批次排班
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: nursing-shift-schedule-route.js
 * Project: @erpv3/backend
 * File Created: 2022-10-24 11:55:23 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { NursingShiftScheduleController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/nursingShiftSchedules')
  .get('/', NursingShiftScheduleController.readList)
  .post('/', NursingShiftScheduleController.create)
  .post('/batch', NursingShiftScheduleController.batch)
  .post('/copy', NursingShiftScheduleController.copy)
  .patch('/:nursingShiftScheduleId', NursingShiftScheduleController.update)
  .delete('/:nursingShiftScheduleId', NursingShiftScheduleController.delete);

module.exports = _router;
