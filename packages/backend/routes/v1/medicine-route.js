/**
 * FeaturePath: 經營管理-用藥管理-藥品管理-CRUD
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-route.js
 * Project: @erpv3/backend
 * File Created: 2022-08-09 04:08:23 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { MedicineController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/medicines')
  .get('/:category', MedicineController.readList)
  .patch('/:medicineId', MedicineController.update)
  .get('/:category/:medicineId', MedicineController.read)
  .post('/', MedicineController.create)
  .delete('/:medicineId', MedicineController.delete)
  .patch('/:medicineId/:field', MedicineController.updateField);

module.exports = _router;
