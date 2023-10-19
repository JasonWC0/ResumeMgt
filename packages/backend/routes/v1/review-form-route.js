/**
 * FeaturePath: 經營管理-系統管理-審核-檢視已審核列表
 * FeaturePath: 經營管理-系統管理-審核-檢視待審核列表
 * FeaturePath: 經營管理-系統管理-審核-檢視審核列表
 * FeaturePath: 經營管理-系統管理-審核-檢視審核歷程
 * FeaturePath: 經營管理-系統管理-審核-編輯審核狀態
 * FeaturePath: 經營管理-系統管理-審核-批次編輯審核狀態
 * FeaturePath: 經營管理-系統管理-審核-編輯審核單
 * FeaturePath: 經營管理-系統管理-審核-新增審核單
 * FeaturePath: 經營管理-系統管理-審核-刪除審核單
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: review-form-route.js
 * Project: @erpv3/backend
 * File Created: 2022-04-22 02:16:14 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { ReviewFormController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/reviewForms');
_router
  .post('/', ReviewFormController.create) // create review **data**
  .patch('/:reviewStatusId', ReviewFormController.update) // update review  **data**
  .get('/:reviewStatusId', ReviewFormController.read) // get review  **data**
  .get('/', ReviewFormController.readList) // get review  **data** list
  .delete('/:reviewStatusId', ReviewFormController.delete) // delete review  **data**
  .get('/f/history', ReviewFormController.readReviewHistory) // get **form** review history
  .get('/e/pending', ReviewFormController.readPendingList) // get **employee** pending review list
  .get('/e/audited', ReviewFormController.readAuditedList) // get **employee** audited review list
  .patch('/s/:action', ReviewFormController.updateMultiStatus) // update review status (multi)
  .patch('/:reviewStatusId/s/:action', ReviewFormController.updateStatus); // update review status

module.exports = _router;
