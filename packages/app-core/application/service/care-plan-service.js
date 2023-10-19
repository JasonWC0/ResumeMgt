/* eslint-disable no-unused-vars */
/* eslint-disable newline-per-chained-call */
/**
 * FeaturePath: 個案管理-計畫-照顧計畫-編輯照顧計畫
 * FeaturePath: 個案管理-計畫-照顧計畫-檢視最新照顧計畫
 * FeaturePath: 個案管理-基本資料-個案資訊-更新照顧計畫html
 * FeaturePath: 個案管理-基本資料-個案資訊-編輯基本資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: care-plan-service.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-12 04:52:35 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');
const { models } = require('@erpv3/app-common');
const { CustomUtils, CustomValidator } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { CarePlanRepository } = require('../../infra/repositories');
const {
  coreErrorCodes, planTypeCodes, cmsLevelCodes,
  reliefTypeCodes, pricingTypeCodes, CarePlanEntity,
} = require('../../domain');

const dateFormat = 'YYYY/MM/DD';

const newestQbe = {
  planType: planTypeCodes.normal,
  $or: [
    { planEndDate: { $exists: false } },
    { planEndDate: { $in: [null, ''] } }
  ],
};

function flattenDeep(arr) {
  return arr.reduce((acc, val) => (Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val)), []);
}
const pickLargestArrIndex = (data, arr) => {
  if (!CustomValidator.nonEmptyArray(data)) { return null; }
  return arr[Math.max(...data.map((d) => arr.findIndex((value) => value === d)))];
};
const pickLargestNumber = (data) => {
  if (!CustomValidator.nonEmptyArray(data)) { return null; }
  return Math.max(...data);
};
const pickObjIsTrue = (data) => {
  if (!CustomValidator.nonEmptyArray(data)) { return false; }
  return data.some((d) => (CustomValidator.isBoolean(d) && d === true));
};
const includeAllServiceItem = (data) => {
  if (!CustomValidator.nonEmptyArray(data)) { return []; }

  const result = [];
  data = flattenDeep(data);
  const itemIds = [...new Set(data.map((d) => (d.itemId)))];
  for (const itemId of itemIds) {
    const items = data.filter((d) => d.itemId === itemId);
    const maxAmount = Math.max(...items.map((d) => d.amount));
    result.push({
      itemId,
      itemType: items[0].itemType,
      amount: maxAmount,
    });
  }
  return result;
};
const OPTPriorityRuleType = {
  PICK_LARGEST_ARR_INDEX: pickLargestArrIndex,
  PICK_LARGEST_NUMBER: pickLargestNumber,
  PICK_OBJ_IS_TRUE: pickObjIsTrue,
  INCLUDE_ALL_SERVICE_ITEM: includeAllServiceItem,
};
const OPTPriorityRule = {
  // CMS等級
  cmsLevel: {
    type: OPTPriorityRuleType.PICK_LARGEST_ARR_INDEX,
    arr: [
      cmsLevelCodes.level1,
      cmsLevelCodes.level2,
      cmsLevelCodes.level3,
      cmsLevelCodes.level4,
      cmsLevelCodes.level5,
      cmsLevelCodes.level6,
      cmsLevelCodes.level7,
      cmsLevelCodes.level8
    ],
  },
  // 福利身份別
  reliefType: {
    type: OPTPriorityRuleType.PICK_LARGEST_ARR_INDEX,
    arr: [
      reliefTypeCodes.normal,
      reliefTypeCodes.middleLowIncome,
      reliefTypeCodes.lowIncome
    ],
  },
  // 計價類別
  pricingType: {
    type: OPTPriorityRuleType.PICK_LARGEST_ARR_INDEX,
    arr: [
      pricingTypeCodes.normal,
      pricingTypeCodes.offshoreIsland
    ],
  },
  // 請外勞照護或領有特照津貼
  foreignCareSPAllowance: {
    type: OPTPriorityRuleType.PICK_OBJ_IS_TRUE,
  },
  // 照顧及專業服務(BC碼).給付額度(元)
  'bcPayment.quota': {
    type: OPTPriorityRuleType.PICK_LARGEST_NUMBER,
  },
  // 照顧及專業服務(BC碼).補助金額(元)
  'bcPayment.subsidy': {
    type: OPTPriorityRuleType.PICK_LARGEST_NUMBER,
  },
  // 照顧及專業服務(BC碼).民眾部份負擔(元)
  'bcPayment.copayment': {
    type: OPTPriorityRuleType.PICK_LARGEST_NUMBER,
  },
  // 照顧及專業服務(BC碼).超額自費(元)
  'bcPayment.excessOwnExpense': {
    type: OPTPriorityRuleType.PICK_LARGEST_NUMBER,
  },
  // 喘息服務(G碼).給付額度(元)
  'gPayment.quota': {
    type: OPTPriorityRuleType.PICK_LARGEST_NUMBER,
  },
  // 喘息服務(G碼).補助金額(元)
  'gPayment.subsidy': {
    type: OPTPriorityRuleType.PICK_LARGEST_NUMBER,
  },
  // 喘息服務(G碼).民眾部份負擔(元)
  'gPayment.copayment': {
    type: OPTPriorityRuleType.PICK_LARGEST_NUMBER,
  },
  // AA08申報.申報B碼
  'AA08Declared.B': {
    type: OPTPriorityRuleType.PICK_OBJ_IS_TRUE,
  },
  // AA08申報.申報C碼
  'AA08Declared.C': {
    type: OPTPriorityRuleType.PICK_OBJ_IS_TRUE,
  },
  // AA09申報.申報B碼
  'AA09Declared.B': {
    type: OPTPriorityRuleType.PICK_OBJ_IS_TRUE,
  },
  // AA09申報.申報C碼
  'AA09Declared.C': {
    type: OPTPriorityRuleType.PICK_OBJ_IS_TRUE,
  },
  // AA09申報.申報G碼
  'AA09Declared.G': {
    type: OPTPriorityRuleType.PICK_OBJ_IS_TRUE,
  },
  // 使用BA12
  useBA12: {
    type: OPTPriorityRuleType.PICK_OBJ_IS_TRUE,
  },
  // 支援服務項目
  serviceItems: {
    type: OPTPriorityRuleType.INCLUDE_ALL_SERVICE_ITEM,
  },
};

class CarePlanService {
  static _genOPTCarePlan(caseId, year, month, carePlans) {
    const momentMonth = month - 1;
    const planStartDate = moment().set('year', year).set('month', momentMonth).startOf('month').toDate();
    const planEndDate = moment().set('year', year).set('month', momentMonth).endOf('month').toDate();
    const OPTDecisionRefIds = carePlans.map((carePlan) => carePlan.id);

    const optCarePlan = {
      caseId,
      planType: planTypeCodes.optDecision,
      planStartDate,
      planEndDate,
      AA08Declared: { B: false, C: false },
      AA09Declared: { B: false, C: false, G: false },
      OPTDecisionRefIds,
    };
    for (const key of Object.keys(OPTPriorityRule)) {
      const _type = 'type';
      const { arr } = OPTPriorityRule[key];
      const data = carePlans.map((carePlan) => key.split('.').reduce((o, i) => o[i], carePlan));
      const result = arr ? OPTPriorityRule[key][_type](data, arr) : OPTPriorityRule[key][_type](data);
      const _keys = key.split('.');
      if (_keys.length === 1) {
        optCarePlan[_keys[0]] = result;
      } else {
        // 目前最多僅判斷兩層
        if (!optCarePlan[_keys[0]] || Object.keys(optCarePlan[_keys[0]]).length === 0) { optCarePlan[_keys[0]] = {}; }
        optCarePlan[_keys[0]][_keys[1]] = result;
      }
    }

    return new CarePlanEntity().bind(optCarePlan);
  }

  static async _pickHistoryRelation(carePlanId, caseId) {
    // sort: new to old
    const historyCarePlanList = await CarePlanRepository.findList({ caseId, planType: planTypeCodes.normal, planEndDate: { $nin: [null, ''] } });
    const pickIndex = historyCarePlanList.findIndex((cp) => cp.id === carePlanId);
    // the carePlanId not in the historyList
    if (pickIndex === -1) { throw new models.CustomError(coreErrorCodes.ERR_CARE_PLAN_NOT_EXIST); }

    const newestOne = (pickIndex === 0) ? await CarePlanService.takeNewest(caseId) : null;
    const beforeOne = (historyCarePlanList.length !== 1 && (pickIndex !== historyCarePlanList.length - 1)) ? historyCarePlanList[pickIndex + 1] : null;
    const afterOne = (historyCarePlanList.length !== 1 && (pickIndex !== 0)) ? historyCarePlanList[pickIndex - 1] : null;
    return { beforeOne, afterOne, newestOne };
  }

  static async _updateOneAndBefore(carePlan, beforeOne, obj, baseInfo, modifier = '') {
    const { id, caseId } = carePlan;

    let beforeOneToOPTYearMonth = [];
    let thisToOPTYearMonth = [];
    const session = await DefaultDBClient.takeConnection().startSession();
    await session.withTransaction(async () => {
      const _obj = {
        __cc: baseInfo.__cc,
        __sc: baseInfo.__sc,
        modifier,
      };

      // 更新前一筆歷史計畫的結束日期
      if (beforeOne) {
        const relationObj = CustomUtils.deepCopy(obj);
        relationObj.planEndDate = moment(obj.planStartDate, dateFormat).subtract(1, 'd').toDate();
        await CarePlanRepository.updateById(beforeOne.id, relationObj);
        beforeOneToOPTYearMonth = CarePlanService.getDiffYearMonth(beforeOne.planEndDate, relationObj.planEndDate);
      }

      // 更新此筆計畫
      await CarePlanRepository.updateById(id, { ...obj, ..._obj });
      thisToOPTYearMonth = CarePlanService.getDiffYearMonth(carePlan.planStartDate, moment(obj.planStartDate, dateFormat).toDate());
    });
    session.endSession();

    // 針對有異動照顧計劃的月份，重新計算最優照顧計畫
    const tempOPTYearMonth = [...beforeOneToOPTYearMonth, ...thisToOPTYearMonth];
    const toOPTYearMonth = [];
    for (const _temp of tempOPTYearMonth) {
      if (!toOPTYearMonth.some((d) => d.year === _temp.year && d.month === _temp.month)) {
        toOPTYearMonth.push(_temp);
      }
    }
    await Promise.all(toOPTYearMonth.map(async (ymData) => {
      const { year, month } = ymData;
      await CarePlanService.monthOPTDecision(caseId, year, month, session);
    }));
  }

  static async _createNew(carePlan, refCarePlanId, refCarePlanObj, session) {
    const newRes = await CarePlanRepository.create(carePlan, session);
    await CarePlanRepository.updateById(refCarePlanId, refCarePlanObj, session);
    return newRes;
  }

  static getDiffYearMonth(date1, date2) {
    date1 = moment(date1).startOf('month');
    date2 = moment(date2).startOf('month');

    const largerDate = date1.isSameOrBefore(date2) ? date2 : date1;
    const smallerDate = date1.isSameOrBefore(date2) ? date1 : date2;
    const diffMonth = largerDate.diff(smallerDate, 'month');
    const YMArr = [];
    for (let i = 0; i <= diffMonth; i++) {
      const _smallerDate = CustomUtils.deepCopy(smallerDate);
      const _date = _smallerDate.add(i, 'month');
      YMArr.push({ year: _date.year(), month: _date.month() + 1 });
    }
    return YMArr;
  }

  static async takeNewest(caseId) {
    const qbe = CustomUtils.deepCopy(newestQbe);
    qbe.caseId = caseId;
    const carePlanRes = await CarePlanRepository.findOne(qbe);
    return carePlanRes;
  }

  static async updateNewestOnly(caseId, obj, session = null) {
    const qbe = CustomUtils.deepCopy(newestQbe);
    qbe.caseId = caseId;
    const carePlanRes = await CarePlanRepository.updateByQbe(qbe, obj, session);
    return carePlanRes;
  }

  static async monthOPTDecision(caseId, year, month, baseInfo, modifier = '', session = null) {
    const momentMonth = month - 1;
    // 刪除該月最優照顧計畫
    const deleteObj = {
      caseId,
      planType: planTypeCodes.optDecision,
      planStartDate: moment().set('year', year).set('month', momentMonth).startOf('month').toDate(),
    };
    await CarePlanRepository.deleteByQbe(deleteObj, baseInfo, modifier, session);

    // 取得該月一般照顧計畫
    const takeObj = {
      caseId,
      planType: planTypeCodes.normal,
      planStartDate: { $lte: moment().set('year', year).set('month', momentMonth).endOf('month').toDate() },
      $or: [
        { planEndDate: { $exists: false } },
        { planEndDate: { $in: [null, ''] } },
        { planEndDate: { $gte: moment().set('year', year).set('month', momentMonth).startOf('month').toDate() } }
      ],
    };
    const carePlanList = await CarePlanRepository.findList(takeObj);

    // 計算最優照顧計畫
    const optCarePlanEntity = CarePlanService._genOPTCarePlan(caseId, year, month, carePlanList);
    optCarePlanEntity.bindBaseInfo(baseInfo).bindCreator(modifier).bindModifier(modifier);
    await CarePlanRepository.create(optCarePlanEntity);
  }

  static async createNewestOne(carePlan, refCarePlan, baseInfo, modifier = '', session = null) {
    let newRes;
    carePlan.bindBaseInfo(baseInfo).bindCreator(modifier).bindModifier(modifier);
    const reNewObj = {
      __cc: baseInfo.__cc,
      __sc: baseInfo.__sc,
      modifier,
      planEndDate: moment(carePlan.planStartDate, dateFormat).subtract(1, 'd').format(dateFormat),
    };

    if (session) {
      newRes = await CarePlanService._createNew(carePlan, refCarePlan.id, reNewObj, session);
    } else {
      const _session = await DefaultDBClient.takeConnection().startSession();
      await _session.withTransaction(async () => {
        newRes = await CarePlanService._createNew(carePlan, refCarePlan.id, reNewObj, _session);
      });
      _session.endSession();
    }

    // 針對有異動照顧計劃的月份，重新計算最優照顧計畫
    const toOPTYearMonth = CarePlanService.getDiffYearMonth(refCarePlan.planStartDate, moment(carePlan.planStartDate, dateFormat).toDate());
    const { caseId } = carePlan;
    await Promise.all(toOPTYearMonth.map(async (ymData) => {
      const { year, month } = ymData;
      await CarePlanService.monthOPTDecision(caseId, year, month);
    }));
    return newRes;
  }

  static async updateNewestOne(carePlan, obj, baseInfo, modifier = '') {
    const { caseId } = carePlan;
    const resList = await CarePlanRepository.findList({ caseId, planType: planTypeCodes.normal, planEndDate: { $nin: [null, ''] } });
    let maxDate = null;
    if (resList.length > 0) {
      maxDate = new Date(Math.max(...resList.map((element) => new Date(element.planStartDate))));
      if (moment(obj.planStartDate, dateFormat).isSameOrBefore(maxDate)) { throw new models.CustomError(coreErrorCodes.ERR_PLAN_START_DATE_WRONG_VALUE); }
    }
    const beforeOne = maxDate ? resList.find((res) => res.planStartDate === maxDate) : null;

    await CarePlanService._updateOneAndBefore(carePlan, beforeOne, obj, baseInfo, modifier);
  }

  static async updateHistoryOne(carePlan, obj, baseInfo, modifier = '') {
    if (moment(obj.planStartDate, dateFormat).isSameOrAfter(moment(carePlan.planStartDate))) { throw new models.CustomError(coreErrorCodes.ERR_PLAN_START_DATE_WRONG_VALUE); }

    const { id, caseId } = carePlan;
    const { beforeOne } = await CarePlanService._pickHistoryRelation(id, caseId);
    if (beforeOne && moment(obj.planStartDate, dateFormat).isSameOrBefore(moment(beforeOne.planStartDate))) { throw new models.CustomError(coreErrorCodes.ERR_PLAN_START_DATE_WRONG_VALUE); }

    await CarePlanService._updateOneAndBefore(carePlan, beforeOne, obj, baseInfo, modifier);
  }

  static async deleteHistoryOne(carePlan, baseInfo, modifier = '') {
    const { id, caseId } = carePlan;
    const { beforeOne, afterOne, newestOne } = await CarePlanService._pickHistoryRelation(id, caseId);

    let toOPTYearMonth = [];
    const session = await DefaultDBClient.takeConnection().startSession();
    await session.withTransaction(async () => {
      const obj = {
        __cc: baseInfo.__cc,
        __sc: baseInfo.__sc,
        modifier,
      };

      /**
       * 1. 無前後筆歷史計畫，修改"最新照顧計畫.起始日期"為"此筆欲刪除計畫.起始日期"
       * 2. 有前一筆歷史計畫，修改"前一筆照顧計畫.結束日期"為"此筆欲刪除計畫.結束日期"
       * 3. (有後一筆歷史紀錄)，修改"後一筆照顧計畫.起始日期"為"此筆欲刪除計畫.起始日期"
       */
      const relationObj = CustomUtils.deepCopy(obj);
      if (!beforeOne && !afterOne) {
        // 1. 無前後筆歷史計畫，修改"最新照顧計畫.起始日期"為"此筆欲刪除計畫.起始日期"
        relationObj.planStartDate = carePlan.planStartDate;
        await CarePlanService.updateNewestOnly(caseId, relationObj, session);
        toOPTYearMonth = CarePlanService.getDiffYearMonth(carePlan.planStartDate, newestOne.planStartDate);
      } else if (beforeOne) {
        // 2. 有前一筆歷史計畫，修改"前一筆照顧計畫.結束日期"為"此筆欲刪除計畫.結束日期"
        relationObj.planEndDate = carePlan.planEndDate;
        await CarePlanRepository.updateById(beforeOne.id, relationObj, session);
        toOPTYearMonth = CarePlanService.getDiffYearMonth(carePlan.planEndDate, beforeOne.planEndDate);
      } else {
        // 3. (有後一筆歷史紀錄)，修改"後一筆照顧計畫.起始日期"為"此筆欲刪除計畫.起始日期"
        relationObj.planStartDate = carePlan.planStartDate;
        await CarePlanRepository.updateById(afterOne.id, relationObj, session);
        toOPTYearMonth = CarePlanService.getDiffYearMonth(carePlan.planStartDate, afterOne.planStartDate);
      }
      // 刪除此筆歷史計畫
      await CarePlanRepository.deleteById(id, obj);
    });
    session.endSession();

    // 針對有異動照顧計劃的月份，重新計算最優照顧計畫
    await Promise.all(toOPTYearMonth.map(async (ymData) => {
      const { year, month } = ymData;
      await CarePlanService.monthOPTDecision(caseId, year, month);
    }));
  }

  static async findeNewestOneByMonth(caseId, year, month) {
    const momentMonth = month - 1;
    // 取得該月一般照顧計畫
    const takeObj = {
      caseId,
      planType: planTypeCodes.normal,
      planStartDate: { $lte: moment().set('year', year).set('month', momentMonth).endOf('month').toDate() },
      $or: [
        { planEndDate: { $exists: false } },
        { planEndDate: { $in: [null, ''] } },
        { planEndDate: { $gte: moment().set('year', year).set('month', momentMonth).startOf('month').toDate() } }
      ],
    };
    const carePlanList = await CarePlanRepository.findList(takeObj);
    // 取得該月最新照顧計畫
    const newstOne = carePlanList?.[0];

    return newstOne;
  }
}

module.exports = CarePlanService;
