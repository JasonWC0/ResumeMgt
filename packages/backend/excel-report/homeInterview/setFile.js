/**
 * FeaturePath: 經營管理-報表產出-個案報表-到宅訪視紀錄表
 * Accountable: Xiao Lin, JoyceS Hsu
 */

const moment = require('moment');

const setFile = require('../base/setFile');

const dateFormat = 'YYYY/MM/DD';

/**
 * 設定報表參數，包含output和input檔案名稱路徑等
 * @param {object} reportFileObj 報表檔案物件
 */
function SetFile(reportFileObj) {
  const _startDate = moment(reportFileObj.startDate, dateFormat);
  const _endDate = moment(reportFileObj.endDate, dateFormat);
  const outputFileName = `${_startDate.year()}年${_startDate.month() + 1}月${_startDate.date()}日-${_endDate.year()}年${_endDate.month() + 1}月${_endDate.date()}日-${reportFileObj.companyDisplayName}-到宅訪視紀錄表.zip`;
  const outputPath = `company/${reportFileObj.companyId}/report-${reportFileObj.type}/${outputFileName}`;
  setFile(reportFileObj, outputPath, outputFileName, reportFileObj.templateFileName);
}

module.exports = SetFile;
