/**
 * FeaturePath: 個案管理-基本資料-個案資訊-新增個案資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-編輯個案資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-檢視個案資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-檢視個案清單
 * FeaturePath: 個案管理-基本資料-個案資訊-刪除個案資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-新增個案服務資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-刪除個案服務資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-匯入照顧計畫
 * FeaturePath: 個案管理-基本資料-個案資訊-編輯照顧計畫
 * FeaturePath: 個案管理-基本資料-個案資訊-更新照顧計畫html
 * FeaturePath: 個案管理-基本資料-個案資訊-自動判定身心障礙
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const Router = require('@koa/router');
const { AppUpload } = require('../../app-upload');
const coreV1Ctrls = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/cases')
  .get('/:caseId', coreV1Ctrls.CaseController.findCase)
  .get('/', coreV1Ctrls.CaseController.findCaseList)
  .post('/', coreV1Ctrls.CaseController.createCase)
  .post('/:caseId/:caseService', coreV1Ctrls.CaseController.createService)
  .patch('/:caseId', coreV1Ctrls.CaseController.updateCase)
  .delete('/:caseId', coreV1Ctrls.CaseController.deleteCase)
  .delete('/:caseId/:caseService', coreV1Ctrls.CaseController.deleteService)
  .post('/upload', AppUpload.useSingleHandler('file'), coreV1Ctrls.CaseController.uploadHtml)
  .post('/htmlFile', coreV1Ctrls.CaseController.createHtml)
  .patch('/:caseId/htmlFile', coreV1Ctrls.CaseController.updateHtml)
  .get('/:caseId/autoJudgeAA11', coreV1Ctrls.CaseController.autoJudgeAA11);

module.exports = _router;
