/**
 * FeaturePath: 經營管理-報表產出-個案報表-電話訪視紀錄表
 * Accountable: Xiao Lin, JoyceS Hsu
 */

const util = require('util');
const path = require('path');
const fs = require('fs');

const archiver = require('archiver');
const moment = require('moment');

const { CustomUtils } = require('@erpv3/app-common/custom-tools');
const readFile = require('../base/readFile');

const dateFormat = 'YYYY/MM/DD';
const printAreaEndOffset = 3;
const pageSetup = {
  printArea: 'A1:O%s',
  orientation: 'landscape',
  fitToPage: true,
  fitToWidth: 1,
  margins: {
    left: 0.25,
    right: 0.25,
    top: 0.75,
    bottom: 0.75,
    header: 0.3,
    footer: 0.3,
  },
};
const commonStyle = {
  alignment: {
    vertical: 'middle',
    wrapText: true,
  },
};
const centerStyle = {
  ...commonStyle,
  alignment: {
    ...commonStyle.alignment,
    horizontal: 'center',
  },
};
const workSheetColumns = [
  {
    header: '案主姓名', key: 'caseName', width: 12, style: centerStyle,
  },
  {
    header: '電訪日期', key: 'interviewDate', width: 13, style: centerStyle,
  },
  {
    header: '受訪者', key: 'respondents', width: 16, style: centerStyle,
  },
  {
    header: '居服員', key: 'employeeName', width: 10, style: centerStyle,
  },
  {
    header: '居服員遵守服務時間', key: 'complyTime', width: 14, style: commonStyle,
  },
  {
    header: '居服員服務態度', key: 'attitude', width: 15, style: commonStyle,
  },
  {
    header: '居服員確實執行服務項目', key: 'executeItem', width: 20, style: commonStyle,
  },
  {
    header: '居家服務是否減輕照顧負擔', key: 'careEffort', width: 20, style: commonStyle,
  },
  {
    header: '居服員服務時，是否有不恰當行為', key: 'inappropriateBehavior', width: 20, style: commonStyle,
  },
  {
    header: '前次追蹤事項', key: 'previousTrackingItems', width: 30, style: commonStyle,
  },
  {
    header: '處遇計畫', key: 'plan', width: 30, style: commonStyle,
  },
  {
    header: '本次訪視摘要', key: 'summary', width: 30, style: commonStyle,
  },
  {
    header: '追蹤事項', key: 'trackingItems', width: 30, style: commonStyle,
  },
  // 目前人工簽章不使用替代值
  {
    header: '居服督導核章', key: 'employeeStamp', width: 20, style: commonStyle,
  },
  // 目前人工簽章不使用替代值
  {
    header: '主任核章', key: 'head', width: 20, style: commonStyle,
  }
];
const dataStartRowOffset = 4;
const borderThinText = 'thin';

/**
 * 輸出報表檔案'
 * @param {object} reportFileObj 報表檔案物件
 */
async function WriteFile(reportFileObj) {
  const tempFileName = path.resolve(process.cwd(), 'packages', 'template', 'excel', reportFileObj.templateFileName);
  // 重組需要讀取 template 的路徑
  reportFileObj.templateFileName = tempFileName;
  await readFile(reportFileObj);
  const {
    data,
    workbook,
    startDate,
    endDate,
    tempFolderPath,
    outputFileName,
    companyDisplayName,
  } = reportFileObj;

  const _startDate = moment(startDate, dateFormat);
  const _endDate = moment(endDate, dateFormat);

  const fileNamePaths = [];
  for await (const caseId of Object.keys(data)) {
    // 經過第二次迴圈會造成第一份 excel 資料顯示有問題，所以深拷貝 workbook，不影響原本 template 的資料
    const newWorkbook = CustomUtils.deepCopy(workbook);
    const { formResults, caseName: dataCaseName } = data[caseId];
    const worksheet = newWorkbook.worksheets[0];

    // 設定列印區塊
    worksheet.pageSetup.printArea = util.format(pageSetup.printArea, formResults.length + printAreaEndOffset);
    // 列印橫式
    worksheet.pageSetup.orientation = pageSetup.orientation;
    // 設為適合頁面 => 一頁寬
    worksheet.pageSetup.fitToPage = pageSetup.fitToPage;
    worksheet.pageSetup.fitToWidth = pageSetup.fitToWidth;
    // 邊界間隔
    worksheet.pageSetup.margins = pageSetup.margins;

    formResults.forEach((formResult, index) => {
      const {
        caseName,
        interviewDate,
        respondents,
        employeeName,
        complyTime,
        attitude,
        executeItem,
        careEffort,
        inappropriateBehavior,
        previousTrackingItems,
        plan,
        summary,
        trackingItems,
      } = formResult.result;

      // 重新命名分頁名稱
      worksheet.name = dataCaseName;

      worksheet.columns = workSheetColumns;

      const currentRow = index + dataStartRowOffset;
      const row = worksheet.getRow(currentRow);
      row.values = {
        caseName,
        interviewDate,
        respondents,
        employeeName,
        complyTime,
        attitude,
        executeItem,
        careEffort,
        inappropriateBehavior,
        previousTrackingItems,
        plan,
        summary,
        trackingItems,
        // employeeStamp 為核章，固定至少三個空格行高度
        employeeStamp: '\n\n\n',
        // head 為核章，固定至少三個空格行高度
        head: '\n\n\n',
      };

      // 放在 column 前面，機構名稱會出現問題
      worksheet.getCell('O1').value = `${companyDisplayName}     電話訪視紀錄表`;

      // 設定邊框
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: borderThinText },
          left: { style: borderThinText },
          bottom: { style: borderThinText },
          right: { style: borderThinText },
        };
      });

      row.commit();
    });

    // 個別 excel 名稱格式
    const excelFileNamePath = `${_startDate.year()}年${_startDate.month() + 1}月${_startDate.date()}日-${_endDate.year()}年${_endDate.month() + 1}月${_endDate.date()}日-${companyDisplayName}-%s-電話訪視紀錄表.xlsx`;
    // 個案 excel 檔名
    const tempOutputFileNameByCaseName = util.format(excelFileNamePath, dataCaseName);
    // excel 儲存路徑
    const excelFilePath = path.resolve(tempFolderPath, tempOutputFileNameByCaseName);
    await newWorkbook.xlsx.writeFile(excelFilePath);
    fileNamePaths.push({ excelFilePath, tempOutputFileNameByCaseName });
  }

  const archive = archiver('zip', { forceLocalTime: true, zlib: { level: 3 } });

  const zipNamePath = `${tempFolderPath}/${outputFileName}`;
  const output = fs.createWriteStream(zipNamePath);
  archive.pipe(output);
  fileNamePaths.forEach(({ excelFilePath, tempOutputFileNameByCaseName }) => {
    archive.file(excelFilePath, { name: tempOutputFileNameByCaseName });
  });
  await archive.finalize();
}

module.exports = WriteFile;
