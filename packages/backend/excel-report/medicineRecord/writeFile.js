/* eslint-disable object-curly-newline */
/**
 * FeaturePath: 經營管理-報表產出-個案報表-用藥紀錄寫入檔案
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: writeFile.js
 * Project: @erpv3/backend
 * File Created: 2022-09-05 04:16:36 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */
const ExcelJS = require('exceljs');
const moment = require('moment');
const { models } = require('@erpv3/app-common');
const ReadFile = require('../base/readFile');

const commonStyle = {
  alignment: { vertical: 'middle' },
};

/**
 * 輸出報表檔案
 * @param {object} reportFileObj 報表檔案物件
 */
async function WriteFile(reportFileObj) {
  try {
    await ReadFile(reportFileObj);
    if (!reportFileObj.workbook) {
      reportFileObj.workbook = new ExcelJS.Workbook();
    }

    const { workbook, data } = reportFileObj;
    Object.keys(data).forEach((caseId) => {
      const _data = data[caseId];
      const { records, caseName } = _data;

      const worksheet = workbook.addWorksheet(caseName);
      worksheet.columns = [
        { header: '指定用藥時間', key: 'expectedUseAt', width: 20, style: commonStyle },
        { header: '實際用藥時間', key: 'actualUseAt', width: 30, style: commonStyle },
        { header: '個案姓名', key: 'caseName', width: 15, style: commonStyle },
        { header: '施藥人員', key: 'workerName', width: 15, style: commonStyle },
        { header: '用藥計畫名稱', key: 'planName', width: 50, style: commonStyle },
        { header: '用藥狀況', key: 'medicineStr', width: 50, style: { alignment: { ...commonStyle.alignment, wrapText: true } } },
        { header: '備註', key: 'remark', width: 50, style: { alignment: { ...commonStyle.alignment, wrapText: true } } }
      ];
      worksheet.getRow(1).eachCell((cell) => {
        cell.style = { alignment: { horizontal: 'center' } };
      });

      records.forEach((record, index) => {
        const row = worksheet.getRow(index + 2);
        row.values = {
          expectedUseAt: `${moment(record.expectedUseAt).format('YYYY/MM/DD')} ${record.expectedUseTiming.content}`,
          actualUseAt: moment(record.actualUseAt).isValid() ? `${moment(record.actualUseAt).format('YYYY/MM/DD HH:mm')}` : '',
          caseName: record.caseName,
          workerName: record.workerName,
          planName: record.planName,
          medicineStr: record.medicineStr,
          remark: record.remark,
        };
        row.commit();
      });
      // worksheet.commit();
    });
    // await workbook.commit();

    // reSet output fileName
    if (reportFileObj.query.caseIds && reportFileObj.query.caseIds.length === 1) {
      const uniqueName = data[Object.keys(data)[0]].caseName;
      reportFileObj.tempOutputPath = reportFileObj.tempOutputPath.replace('{$個案姓名}', uniqueName);
      reportFileObj.outputPath = reportFileObj.outputPath.replace('{$個案姓名}', uniqueName);
      reportFileObj.outputFileName = reportFileObj.outputFileName.replace('{$個案姓名}', uniqueName);
    }

    // write file
    await workbook.xlsx.writeFile(reportFileObj.tempOutputPath);
  } catch (ex) {
    throw new models.CustomError('WriteFile ERR');
  }
}

module.exports = WriteFile;
