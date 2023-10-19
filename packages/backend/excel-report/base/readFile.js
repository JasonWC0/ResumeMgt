/**
 * FeaturePath: 經營管理-報表產出-通用-
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: readFile.js
 * Project: @erpv3/backend
 * File Created: 2022-09-05 04:18:01 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */
const ExcelJS = require('exceljs');
const { models, codes } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');

async function ReadFile(reportFileObj) {
  const { templateFileName } = reportFileObj;
  if (!CustomValidator.nonEmptyString(templateFileName)) {
    reportFileObj.workbook = null;
  } else {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(templateFileName);
      reportFileObj.workbook = workbook;
    } catch (ex) {
      throw new models.CustomError(codes.errorCodes.ERR_FILESYSTEM_FAIL);
    }
  }
}

module.exports = ReadFile;
