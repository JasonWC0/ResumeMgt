/**
 * FeaturePath: 經營管理-報表產出-個案報表-用藥紀錄設定檔案
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: setFile.js
 * Project: @erpv3/backend
 * File Created: 2022-09-05 10:48:29 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');
const SetFileBase = require('../base/setFile');

/**
 * 設定報表參數，包含output和input檔案名稱路徑等
 * @param {object} reportFileObj 報表檔案物件
 */
function SetFile(reportFileObj) {
  const _startDate = moment(reportFileObj.startDate, 'YYYY/MM/DD');
  const _endDate = moment(reportFileObj.endDate, 'YYYY/MM/DD');
  let outputFileName = '';
  if (reportFileObj.query.caseId.length === 1) {
    outputFileName = `${_startDate.year()}年${_startDate.month() + 1}月${_startDate.date()}日-${_endDate.year()}年${_endDate.month() + 1}月${_endDate.date()}日-${reportFileObj.companyDisplayName}-{$個案姓名}-用藥紀錄明細.xlsx`;
  } else {
    outputFileName = `${_startDate.year()}年${_startDate.month() + 1}月${_startDate.date()}日-${_endDate.year()}年${_endDate.month() + 1}月${_endDate.date()}日-${reportFileObj.companyDisplayName}-用藥紀錄明細.xlsx`;
  }
  const outputPath = `company/${reportFileObj.companyId}/report-${reportFileObj.type}/${outputFileName}`;
  SetFileBase(reportFileObj, outputPath, outputFileName);
}

module.exports = SetFile;
