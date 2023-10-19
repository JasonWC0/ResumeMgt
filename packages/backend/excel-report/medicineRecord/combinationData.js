/**
 * FeaturePath: 經營管理-報表產出-個案報表-用藥紀錄整理資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: combinationData.js
 * Project: @erpv3/backend
 * File Created: 2022-09-05 04:04:07 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { otherMap, getStringValue } = require('@erpv3/app-core/domain/enums/mapping');
const { medicineUsedTimingTypeCodes } = require('@erpv3/app-core/domain');

/**
 * 計算來源資料產出統計資料
 * @param {object} reportFileObj 報表檔案物件
 */
async function CombinationData(reportFileObj) {
  const { recordData, caseData } = reportFileObj;
  if (!recordData) { return; }

  const data = {};
  recordData.forEach((record) => {
    // combine caseId
    const { caseId } = record;
    if (!Object.keys(data).includes(caseId)) {
      data[caseId] = {};
      const _case = caseData.find((_caseData) => _caseData.caseId === caseId);
      data[caseId].caseName = _case ? _case.caseName : '';
      data[caseId].records = [];
    }

    // trans enum to string
    const { type, content } = record.expectedUseTiming;
    if (CustomValidator.isEqual(medicineUsedTimingTypeCodes.standard, type)) {
      record.expectedUseTiming.content = getStringValue(otherMap.medicineUsedTimingMap, content);
    }

    // trans medicine to String
    let medicineStr = '';
    record.medicines.forEach((medicine, medIdx) => {
      // trans isUsed(boolean) to string
      medicine.isUsed = CustomValidator.isEqual(medicine.isUsed, true) ? '已用藥' : '未用藥';

      if (CustomValidator.nonEmptyString(medicineStr)) {
        medicineStr += ' \r\n';
      }
      const _str = `${medIdx + 1}. ${medicine.englishName} ${medicine.doses}${medicine.doseUnit} ${medicine.isUsed} ${medicine.quantityOfMedUse}單位`;
      medicineStr += _str;
    });
    record.medicineStr = medicineStr;

    // add data
    data[caseId].records.push(record);
  });

  // set caseName
  Object.keys(data).forEach((caseId) => {
    const _data = data[caseId];
    const { records } = _data;
    _data.caseName = CustomValidator.nonEmptyString(_data.caseName) ? _data.caseName : records[-1].caseName;
  });

  reportFileObj.withData(data);
}

module.exports = CombinationData;
