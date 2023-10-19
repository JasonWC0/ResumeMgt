/**
 * FeaturePath: 經營管理-報表產出-個案報表-用藥紀錄讀取資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: getData.js
 * Project: @erpv3/backend
 * File Created: 2022-09-05 02:44:24 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */
const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { medicineRecordStatusCodes } = require('@erpv3/app-core/domain');
const MedicineRecordController = require('../../controllers/v1/medicine-record-controller');

/**
 * 準備報表所需來源資料
 * @param {object} reportFileObj 報表檔案物件
 */
async function GetData(reportFileObj) {
  const { caseId } = reportFileObj.query;
  if (Array.isArray(caseId)) {
    if (CustomValidator.nonEmptyArray(caseId)) {
      reportFileObj.query.caseIds = caseId;
    }
    delete reportFileObj.query.caseId;
  }
  reportFileObj.query.filterDate = 'expectedUseAt';
  reportFileObj.query.status = [medicineRecordStatusCodes.Notice, medicineRecordStatusCodes.UnTaken, medicineRecordStatusCodes.Taken, medicineRecordStatusCodes.PartiallyTaken];
  reportFileObj.query.order = 'expectedUseAt';

  // query record list
  const recordQuery = CustomUtils.deepCopy(reportFileObj.query);
  reportFileObj.recordData = await MedicineRecordController.readListFunc(recordQuery);

  // query case list
  const caseQuery = CustomUtils.deepCopy(reportFileObj.query);
  caseQuery.field = 'caseId';
  reportFileObj.caseData = await MedicineRecordController.readListFunc(caseQuery);

  // Set has Data flag
  reportFileObj.hasData = !!CustomValidator.nonEmptyArray(reportFileObj.recordData);
}

module.exports = GetData;
