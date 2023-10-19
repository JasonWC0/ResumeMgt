/* eslint-disable no-return-assign */
/**
 * FeaturePath: 個案管理-計畫-照顧計畫-新增照顧計畫
 * FeaturePath: 個案管理-計畫-照顧計畫-編輯歷史照顧計畫
 * FeaturePath: 個案管理-計畫-照顧計畫-編輯最新照顧計畫
 * FeaturePath: 個案管理-計畫-照顧計畫-檢視照顧計畫
 * FeaturePath: 個案管理-計畫-照顧計畫-刪除歷史照顧計畫
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: care-plan-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-06-06 06:36:28 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models, codes, tools } = require('@erpv3/app-common');
const { CustomUtils } = require('@erpv3/app-common/custom-tools');
const { CarePlanService } = require('@erpv3/app-core/application/service');
const { CarePlanRepository, ServiceItemRepository } = require('@erpv3/app-core/infra/repositories');
const { UpdateCarePlanHistoryRequest, UpdateCarePlanNewestRequest, CreateCarePlanRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { coreErrorCodes, planTypeCodes } = require('@erpv3/app-core/domain');

class CarePlanController {
  static _checkCost(cost, quota, excessOwnExpense) {
    return cost <= quota + excessOwnExpense;
  }

  static _extractItemType(serviceCode) {
    return serviceCode.substr(0, 1);
  }

  static _prepareObj(mReq, careRes) {
    return {
      ...mReq,
      isHtml: false,
      bcPayment: {
        quota: mReq.bcPayment.quota,
        subsidy: careRes.bcPayment.subsidy,
        copayment: careRes.bcPayment.copayment,
        excessOwnExpense: mReq.bcPayment.excessOwnExpense,
      },
      gPayment: {
        quota: mReq.gPayment.quota,
        subsidy: careRes.bcPayment.subsidy,
        copayment: careRes.bcPayment.copayment,
      },
      serviceItems: tools.CustomValidator.nonEmptyArray(mReq.serviceItems) ? mReq.serviceItems.map((value) => ({
        itemId: value.itemId,
        itemType: CarePlanController._extractItemType(value.obj.serviceCode),
        amount: value.amount,
      })) : [],
    };
  }

  static async _takeDBServiceItems(ids) {
    const _list = await ServiceItemRepository.findByIds(ids);
    tools.CustomValidator.isEqual(_list.length, ids.length, coreErrorCodes.ERR_SUPPORT_SERVICE_ITEM_ID_NOT_EXIST);
    const obj = {};
    _list.forEach((value) => {
      obj[value.id] = value;
    });
    return obj;
  }

  static async _bindServiceItems(reqServiceItems) {
    let bcCost = 0;
    const serviceItemIds = reqServiceItems.map((value) => (value.itemId));
    const serviceItemRes = await CarePlanController._takeDBServiceItems(serviceItemIds);
    reqServiceItems.forEach((item, index) => {
      reqServiceItems[index].obj = serviceItemRes[item.itemId];
      if (['B', 'C'].includes(CarePlanController._extractItemType(serviceItemRes[item.itemId].serviceCode))) {
        bcCost += parseInt(item.amount, 10) * serviceItemRes[item.itemId].cost;
      }
    });
    return { reqServiceItems, bcCost };
  }

  static async readNewest(ctx, next) {
    const { caseId } = ctx.request.query;
    if (!caseId) { throw new models.CustomError(coreErrorCodes.ERR_CASE_ID_IS_EMPTY); }

    const res = await CarePlanService.takeNewest(caseId);

    const response = (res) ? res.toView() : {};
    ctx.state.result = new models.CustomResult().withResult(response);
    await next();
  }

  static async readHistoryList(ctx, next) {
    const { caseId } = ctx.request.query;
    if (!caseId) { throw new models.CustomError(coreErrorCodes.ERR_CASE_ID_IS_EMPTY); }

    const resList = await CarePlanRepository.findList({ caseId, planType: planTypeCodes.normal, planEndDate: { $nin: [null, ''] } });
    const response = resList.map((res) => (res.toView()));
    ctx.state.result = new models.CustomResult().withResult(response);
    await next();
  }

  static async create(ctx, next) {
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new CreateCarePlanRequest().bind(ctx.request.body).checkRequired();
    const careRes = await CarePlanRepository.findById(mReq.refCarePlanId);
    if (!careRes) { throw new models.CustomError(coreErrorCodes.ERR_REF_CARE_PLAN_ID_NOT_EXIST); }

    if (tools.CustomValidator.nonEmptyArray(mReq.serviceItems)) {
      // check serviceItems' itemIds are exist and calc. BC's total
      const { bcCost } = await CarePlanController._bindServiceItems(mReq.serviceItems);

      // check bc cost
      if (!CarePlanController._checkCost(bcCost, mReq.bcPayment.quota, mReq.bcPayment.excessOwnExpense)) {
        throw new models.CustomError(coreErrorCodes.ERR_BC_SERVICE_COST_OVER_QUOTA_AND_OWN_EXPENSE);
      }
    }

    // bind mReq to ref. carePlan
    const obj = CarePlanController._prepareObj(mReq, careRes);
    const newCarePlan = CustomUtils.deepCopy(careRes);
    newCarePlan.bindCreate(obj);
    const newRes = await CarePlanService.createNewestOne(newCarePlan, careRes, { __cc, __sc }, personId);

    ctx.state.result = new models.CustomResult().withResult({ id: newRes.id });
    await next();
  }

  static async updateNewest(ctx, next) {
    const { carePlanId } = ctx.params;
    const { personId } = ctx.state.user;
    const { __vn, __cc, __sc } = ctx.state.baseInfo;
    const mReq = new UpdateCarePlanNewestRequest().bind(ctx.request.body).checkRequired();

    const careRes = await CarePlanRepository.findById(carePlanId);
    if (!careRes) { throw new models.CustomError(coreErrorCodes.ERR_CARE_PLAN_NOT_EXIST); }
    tools.CustomValidator.isEqual(careRes.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    // check is the newest
    if (careRes.planEndDate) { throw new models.CustomError(coreErrorCodes.ERR_PLAN_ID_IS_NOT_NEWEST); }

    if (tools.CustomValidator.nonEmptyArray(mReq.serviceItems)) {
      // check serviceItems' itemIds are exist and calc. BC's total
      const { bcCost } = await CarePlanController._bindServiceItems(mReq.serviceItems);

      // check bc cost
      if (!CarePlanController._checkCost(bcCost, mReq.bcPayment.quota, mReq.bcPayment.excessOwnExpense)) {
        throw new models.CustomError(coreErrorCodes.ERR_BC_SERVICE_COST_OVER_QUOTA_AND_OWN_EXPENSE);
      }
    }

    const obj = CarePlanController._prepareObj(mReq, careRes);
    await CarePlanService.updateNewestOne(careRes, obj, { __cc, __sc }, personId);

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async updateHistory(ctx, next) {
    const { carePlanId } = ctx.params;
    const { personId } = ctx.state.user;
    const { __vn, __cc, __sc } = ctx.state.baseInfo;
    const mReq = new UpdateCarePlanHistoryRequest().bind(ctx.request.body).checkRequired();

    const careRes = await CarePlanRepository.findById(carePlanId);
    if (!careRes) { throw new models.CustomError(coreErrorCodes.ERR_CARE_PLAN_NOT_EXIST); }
    tools.CustomValidator.isEqual(careRes.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    await CarePlanService.updateHistoryOne(careRes, mReq, { __cc, __sc }, personId);

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async delete(ctx, next) {
    const { carePlanId } = ctx.params;
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;

    const careRes = await CarePlanRepository.findById(carePlanId);
    if (!careRes) { throw new models.CustomError(coreErrorCodes.ERR_CARE_PLAN_NOT_EXIST); }

    await CarePlanService.deleteHistoryOne(careRes, { __cc, __sc }, personId);

    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = CarePlanController;
