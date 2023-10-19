/**
 * FeaturePath: 經營管理-系統管理-用藥提醒-RU
 * FeaturePath: 經營管理-用藥管理-用藥紀錄-RU
 * FeaturePath: 個案管理-紀錄-用藥紀錄-RU
 * FeaturePath: 個案管理-紀錄-用藥紀錄-v25個案排班串接
 * FeaturePath: 個案管理-紀錄-用藥紀錄-v25個案排班狀態串接
 * FeaturePath: 個案管理-紀錄-用藥紀錄-v25個案狀態串接
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-record-route.js
 * Project: @erpv3/backend
 * File Created: 2022-08-24 11:26:48 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { MedicineRecordController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/medicineRecords')
  .patch('/:medicineRecordId', MedicineRecordController.update)
  .get('/', MedicineRecordController.readList)
  .get('/:medicineRecordId', MedicineRecordController.read)
  .post('/batch/caseSchedule', MedicineRecordController.batchCaseSchedule)
  .patch('/batch/scheduleStatus', MedicineRecordController.batchScheduleStatus)
  .patch('/batch/caseStatus', MedicineRecordController.batchCaseStatus);

module.exports = _router;
