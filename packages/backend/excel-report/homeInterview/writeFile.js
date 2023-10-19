/**
 * FeaturePath: 經營管理-報表產出-個案報表-到宅訪視紀錄表
 * Accountable: Xiao Lin, JoyceS Hsu
 */

const util = require('util');
const path = require('path');
const fs = require('fs');

const archiver = require('archiver');
const moment = require('moment');

const { LOGGER } = require('@erpv3/app-common');
const { CustomUtils } = require('@erpv3/app-common/custom-tools');
const readFile = require('../base/readFile');

const dateFormat = 'YYYY/MM/DD';
const pageSetup = {
  printArea: 'A1:I50',
  fitToPage: true,
  fitToWidth: 1,
  fitToHeight: 0,
  horizontalCentered: true,
  margins: {
    left: 0.25,
    right: 0.25,
    top: 0.75,
    bottom: 0.75,
    header: 0.3,
    footer: 0.3,
  },
};
const startRowOffset = 4;
const stampHeightOffset = '\n\n\n';

/**
 * 計算文字長度適當列高
 * @param {string} content 輸入文字內容
 * @param {number} contentPerRow 每列包含多少文字
 */
const getRowsOfContent = (content, contentPerRow) => {
  let rows = 0;
  if (typeof content !== 'string') {
    return 1;
  }

  if (content.includes('\n')) {
    const contents = content.split('\n');

    for (const _content of contents) {
      rows += getRowsOfContent(_content, contentPerRow);
    }
  } else {
    const fullSizeFontLength = content.replace(/[\w\d\s]{2}/g, '全').length;
    rows += Math.ceil((fullSizeFontLength || 1) / contentPerRow);
  }

  return rows;
};

/**
 * 輸出報表檔案
 * @param {object} reportFileObj 報表檔案物件
 */
async function WriteFile(reportFileObj) {
  try {
    const tempFileName = path.resolve(process.cwd(), 'packages', 'template', 'excel', reportFileObj.templateFileName);
    // 重組需要讀取 template 的路徑
    reportFileObj.withTemplateFileName(tempFileName);
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
      worksheet.pageSetup.printArea = pageSetup.printArea;
      // 設為適合頁面
      worksheet.pageSetup.fitToPage = pageSetup.fitToPage;
      // 一頁寬
      worksheet.pageSetup.fitToWidth = pageSetup.fitToWidth;
      // 不設定一頁長
      worksheet.pageSetup.fitToHeight = pageSetup.fitToHeight;
      // 水平置中
      worksheet.pageSetup.horizontalCentered = pageSetup.horizontalCentered;
      // 邊界間隔(窄邊界)
      worksheet.pageSetup.margins = pageSetup.margins;

      formResults.forEach((formResult, index) => {
        const {
          interviewDate,
          caseName,
          respondents,
          address,
          employeeName,
          complyTime,
          executeItem,
          careArtifice,
          attitude,
          burdenOfCare,
          inappropriateBehavior,
          liveWithFamily,
          risk,
          caseResponse,
          healthCheckSleep,
          healthCheckNervous,
          healthCheckDistressed,
          healthCheckMelancholy,
          healthCheckInferiority,
          healthCheckSuicide,
          healthCheckSum,
          caseVisit,
          caregiverStressUnwell,
          caregiverStressTired,
          caregiverStressPhysicalBurden,
          caregiverStressEmotionalImpact,
          caregiverStressSleepDisturbance,
          caregiverStressPoorHealth,
          caregiverStressExhausted,
          caregiverStressMentalPain,
          caregiverStressAngry,
          caregiverStressAffectTravelPlans,
          caregiverStressCommunicationAffected,
          caregiverStressAttention,
          caregiverStressExpensive,
          caregiverStressCannotWork,
          caregiverStressSum,
          income,
          governmentSubsidy,
          spending,
          spendingStatus,
          otherService,
          previousTrackingItems,
          plan,
          summary,
          trackingItems,
        } = formResult;

        // 重新命名分頁名稱
        worksheet.name = dataCaseName;

        // 機構名稱
        worksheet.getCell('I1').value = companyDisplayName;

        const currentColumnIndex = startRowOffset + index;
        worksheet.getColumn(currentColumnIndex).values = [
          companyDisplayName,
          '到宅訪視紀錄表',
          interviewDate,
          caseName,
          respondents,
          address,
          employeeName,
          complyTime,
          executeItem,
          careArtifice,
          attitude,
          burdenOfCare,
          inappropriateBehavior,
          liveWithFamily,
          risk,
          caseResponse,
          healthCheckSleep,
          healthCheckNervous,
          healthCheckDistressed,
          healthCheckMelancholy,
          healthCheckInferiority,
          healthCheckSuicide,
          healthCheckSum,
          caseVisit,
          caregiverStressUnwell,
          caregiverStressTired,
          caregiverStressPhysicalBurden,
          caregiverStressEmotionalImpact,
          caregiverStressSleepDisturbance,
          caregiverStressPoorHealth,
          caregiverStressExhausted,
          caregiverStressMentalPain,
          caregiverStressAngry,
          caregiverStressAffectTravelPlans,
          caregiverStressCommunicationAffected,
          caregiverStressAttention,
          caregiverStressExpensive,
          caregiverStressCannotWork,
          caregiverStressSum,
          income,
          governmentSubsidy,
          spending,
          spendingStatus,
          otherService,
          previousTrackingItems,
          plan,
          summary,
          trackingItems,
          // 督導員(核章)
          stampHeightOffset,
          // 主任(核章)
          stampHeightOffset
        ];
        // 調整欄位 style
        worksheet.getColumn(currentColumnIndex).style = {
          alignment: {
            // 自動換行
            wrapText: true,
            // 垂直置中
            vertical: true,
          },
        };
      });

      // 計算一列的最高欄位高，並將該列設定為計算出來的高度
      worksheet.eachRow((row, rowNumber) => {
        const rowHeight = 20;
        if (rowNumber > 2) {
          row.eachCell((cell, cellIndex) => {
            if (cellIndex > 3) {
              const contentHeightLevel = getRowsOfContent(cell.value, 7);
              row.height = rowHeight * contentHeightLevel > row.height
                ? rowHeight * contentHeightLevel
                : row.height;
            }
          });
        }
      });

      // 個別 excel 名稱格式
      const excelFileNamePath = `${_startDate.year()}年${_startDate.month() + 1}月${_startDate.date()}日-${_endDate.year()}年${_endDate.month() + 1}月${_endDate.date()}日-${companyDisplayName}-%s-到宅訪視紀錄表.xlsx`;
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
    const inZipFilePaths = [];
    fileNamePaths.forEach(({ excelFilePath, tempOutputFileNameByCaseName }) => {
      inZipFilePaths.push(excelFilePath);
      archive.file(excelFilePath, { name: tempOutputFileNameByCaseName });
    });
    reportFileObj.withInZipFilePaths(inZipFilePaths);
    await archive.finalize();
  } catch (ex) {
    LOGGER.info(`phoneInterview writeFile ex ${ex.stack}`);
    throw ex.message;
  }
}

module.exports = WriteFile;
