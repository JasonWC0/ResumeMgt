/**
 * FeaturePath: 住宿式服務-排班-排班管理-班別CRUD
 * FeaturePath: 住宿式服務-排班-排班管理-查詢班別使用中
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: nursing-shift-route.js
 * Project: @erpv3/backend
 * File Created: 2022-10-14 03:22:01 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { NursingShiftController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/nursingShifts')
  .get('/', NursingShiftController.readList)
  .get('/:nursingShiftId', NursingShiftController.read)
  .get('/:nursingShiftId/isUsed', NursingShiftController.isUsed)
  .patch('/:nursingShiftId', NursingShiftController.update)
  .post('/', NursingShiftController.create)
  .delete('/:nursingShiftId', NursingShiftController.delete);

module.exports = _router;
