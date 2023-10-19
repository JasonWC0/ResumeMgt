/**
 * FeaturePath: 個案管理-基本資料-個案資訊-更新照顧計畫html
 * FeaturePath: 個案管理-基本資料-個案資訊-新增基本資料
 * FeaturePath: 個案管理-基本資料-個案資訊-編輯基本資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: judge-aa11-service.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-12 02:15:12 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const disabilityCategoryTypeCodes = require('../../domain/enums/disability-category-type-codes');
const newDisabilityCategoryCodes = require('../../domain/enums/new-disability-category-codes');
const oldDisabilityCategoryCodes = require('../../domain/enums/old-disability-category-codes');
const diseaseHistoryCodes = require('../../domain/enums/disease-history-codes');
const icdCodes = require('../../domain/enums/icd-codes');
const { caseMap } = require('../../domain/enums/mapping');

const LIMIT_AGE = 45;

function excludeNormal(enumList, checkList = []) {
  if ((checkList.length > 1) || ((checkList.length === 1) && (!CustomValidator.isEqual(checkList[0], enumList.normal)))) {
    return true;
  }
  return false;
}

class JudgeAA11Service {
  static judge1(carePlan, birthDate, result) {
    const A3a2 = carePlan.newDisabilityCategories;
    const G4e = carePlan.diseaseHistoryList;
    const checkDiseaseList = [diseaseHistoryCodes.type13, diseaseHistoryCodes.type14, diseaseHistoryCodes.type15];
    const intersection = G4e.filter((x) => checkDiseaseList.includes(x));

    const condition1 = (A3a2.indexOf(newDisabilityCategoryCodes.type1) !== -1);
    const condition2 = (intersection.length !== 0);
    const condition3 = (moment().diff(birthDate, 'y') < LIMIT_AGE);

    if (condition1 && condition2 && condition3) {
      result.isAA11a = true;
    }
    return result;
  }

  static judge2(carePlan, birthDate, result) {
    const A3a2 = carePlan.newDisabilityCategories;
    const G4e = carePlan.diseaseHistoryList;
    const { icd, icdOthers } = carePlan;
    const checkDiseaseList = [diseaseHistoryCodes.type22, diseaseHistoryCodes.type23];
    const intersection = G4e.filter((x) => checkDiseaseList.includes(x));

    const condition1 = (excludeNormal(newDisabilityCategoryCodes, A3a2) || icd.length !== 0) && (intersection.length !== 0);
    const condition2 = (icd.indexOf(icdCodes.type3) !== -1) && (/(R40.2|R40.3)/.test(icdOthers));
    const condition3 = (moment().diff(birthDate, 'y') < LIMIT_AGE);

    if ((condition1 || condition2) && condition3) {
      result.isAA11a = true;
    }
    return result;
  }

  static judge3(carePlan, result) {
    const G4e = carePlan.diseaseHistoryList;
    const condition1 = (G4e.indexOf(diseaseHistoryCodes.type12) !== -1);

    if (condition1) {
      result.isAA11b = true;
    }
    return result;
  }

  static judge4(carePlan, birthDate, result) {
    const A3a3 = carePlan.oldDisabilityCategoriesList;
    const checkOldDisabilityList = [
      oldDisabilityCategoryCodes.type12, oldDisabilityCategoryCodes.type11, oldDisabilityCategoryCodes.type6,
      oldDisabilityCategoryCodes.type10, oldDisabilityCategoryCodes.type14, oldDisabilityCategoryCodes.type9,
      oldDisabilityCategoryCodes.type15
    ];
    const intersection = A3a3.filter((x) => checkOldDisabilityList.includes(x));

    const condition1 = (intersection.length !== 0);
    const condition2 = (moment().diff(birthDate, 'y') < LIMIT_AGE);

    if (condition1 && condition2) {
      result.isAA11a = true;
    }
    return result;
  }

  static judge5(carePlan, birthDate, result) {
    const { icd } = carePlan;

    const condition1 = (icd.indexOf(icdCodes.type1) !== -1);
    const condition2 = (icd.indexOf(icdCodes.type2) !== -1);
    const condition3 = (moment().diff(birthDate, 'y') < LIMIT_AGE);

    if ((condition1 || condition2) && condition3) {
      result.isAA11a = true;
    }
    return result;
  }

  static judgeAA11aRemind(carePlan, birthDate, result) {
    const { disabilityCategoryType, disabilityCategories, oldDisabilityCategories } = carePlan;

    // 條件一
    // - 有領身障手冊則符合[身障]資格: 「身障類別」勾選"無"以外的項目
    let condition1 = false;
    switch (disabilityCategoryType) {
      case disabilityCategoryTypeCodes.new:
        condition1 = excludeNormal(newDisabilityCategoryCodes, disabilityCategories);
        break;
      case disabilityCategoryTypeCodes.old:
        if (CustomValidator.nonEmptyString(oldDisabilityCategories)) {
          const oldDisabilityCodes = Object.keys(oldDisabilityCategoryCodes).map((key) => caseMap.oldDisabilityCategoryMaps[key].value).filter((v) => v !== '正常');
          const findResult = oldDisabilityCodes.find((type) => type.indexOf(oldDisabilityCategories) > -1);
          if (findResult) {
            condition1 = true;
          }
        }
        break;
      default:
        break;
    }

    // 條件二
    // - 未滿45歲
    const condition2 = (moment().diff(birthDate, 'y') < LIMIT_AGE);

    if (condition1 && condition2) {
      result.isAA11aRemind = true;
    }
    return result;
  }
}

module.exports = JudgeAA11Service;
