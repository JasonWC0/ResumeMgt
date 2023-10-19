/**
 * FeaturePath: 經營管理-用藥管理-用藥設定-常用時間RU
 * FeaturePath: 經營管理-用藥管理-用藥設定-常用名稱CRUD
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-setting-route.js
 * Project: @erpv3/backend
 * File Created: 2022-08-08 03:02:20 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { MedicineSettingController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/medicineSettings')
  .get('/medicineUsedTime', MedicineSettingController.readUsedTime)
  .patch('/medicineUsedTime', MedicineSettingController.updateUsedTime)
  .get('/commonlyUsedName', MedicineSettingController.readUsedNameList)
  .post('/commonlyUsedName/:type', MedicineSettingController.createUsedNameList)
  .delete('/commonlyUsedName/:type', MedicineSettingController.deleteUsedNameList)
  .patch('/commonlyUsedName/:type', MedicineSettingController.replaceUsedNameList);

module.exports = _router;
