/**
 * FeaturePath: 經營管理-系統管理-機構服務設定-新增機構
 * FeaturePath: 經營管理-系統管理-機構服務設定-刪除機構
 * FeaturePath: 經營管理-系統管理-機構服務設定-編輯基本資料
 * FeaturePath: 經營管理-系統管理-機構服務設定-編輯機構服務進階設定
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-編輯跑馬燈設定
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-機構服務類型(編輯類型)
 * FeaturePath: 經營管理-系統管理-機構服務設定-檢視基本資料
 * FeaturePath: 經營管理-系統管理-機構服務設定-檢視機構服務進階設定
 * FeaturePath: 經營管理-系統管理-機構服務設定-檢視員工角色權限設定
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-檢視跑馬燈設定
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-檢視服務類型(編輯類型)
 * FeaturePath: 經營管理-評鑑管理-逐案分析-檢視公司日照評鑑表單範本列表
 * FeaturePath: 個案管理-評估-評估管理-檢視公司評估表單範本列表
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: company-route.js
 * Project: @erpv3/backend
 * File Created: 2022-02-10 03:46:52 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const Router = require('@koa/router');
const { CompanyController } = require('../../controllers/v1');

const _router = new Router();
_router.prefix('/companies')
  .post('/', CompanyController.create)
  .delete('/:companyId', CompanyController.delete)
  .get('/', CompanyController.readList)
  .get('/:companyId/:_type', CompanyController.read)
  .get('/:companyId/institutionSetting/:_object', CompanyController.readInstitutionSetting)
  .get('/:companyId/systemSetting/:_object', CompanyController.readSystemSetting)
  .patch('/:companyId/serviceGroup', CompanyController.updateServiceGroup)
  .patch('/:companyId/info', CompanyController.updateInfo)
  .patch('/:companyId/institutionSetting', CompanyController.updateInstitutionSetting)
  .patch('/:companyId/marqueeSetting', CompanyController.updateMarqueeSetting);

module.exports = _router;
