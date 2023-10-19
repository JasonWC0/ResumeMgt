/**
 * FeaturePath: 經營管理-報表產出-通用-
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: setFile.js
 * Project: @erpv3/backend
 * File Created: 2022-09-05 02:00:18 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */
const fsExtra = require('fs-extra');
const path = require('path');
const conf = require('@erpv3/app-common/shared/config');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');

function _checkFileFolder(_path) {
  if (!fsExtra.existsSync(_path)) {
    fsExtra.mkdirSync(_path);
  }
}

function _checkTemplateExist(filename) {
  const tempFileName = path.resolve(process.cwd(), 'packages', 'template', 'excel', filename);

  return fsExtra.existsSync(tempFileName);
}

/**
 * @param {ReportFileObject} reportFileObj
 * @param {string} outputPath 輸出檔案路徑(儲存服務)
 * @param {string} outputFileName 輸出報表檔案名稱
 * @param {string} tempFileName 報表範本檔案名稱
 */
function SetFile(reportFileObj, outputPath, outputFileName, templateFileName = '') {
  const temp = conf.FILE.TEMP.FOLDER;
  const tempFolderPath = path.resolve(process.cwd(), temp);
  reportFileObj
    .withTemplateFileName(templateFileName)
    .withTempOutputPath(path.resolve(tempFolderPath, outputFileName))
    .withOutputPath(outputPath)
    .withOutputFileName(outputFileName)
    .withTempFolderPath(tempFolderPath);

  _checkFileFolder(tempFolderPath);
  if (CustomValidator.nonEmptyString(templateFileName)) {
    _checkTemplateExist(templateFileName);
  }
}

module.exports = SetFile;
