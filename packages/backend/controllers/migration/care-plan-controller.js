/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: care-plan-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-08-02 05:02:02 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const moment = require('moment');
const { models, codes, tools } = require('@erpv3/app-common');
const { coreErrorCodes } = require('@erpv3/app-core/domain');
const { CarePlanRepository } = require('@erpv3/app-core/infra/repositories');
const _CarePlanController = require('../v1/care-plan-controller');

const dateFormat = 'YYYY/MM/DD';

class CarePlanController {
  static async create(ctx, next) {
    const { __cc, __sc } = ctx.state.baseInfo;
    const req = ctx.request.body;
    tools.CustomValidator.nonEmptyString(req.refCarePlanId, coreErrorCodes.ERR_REF_CARE_PLAN_ID_IS_EMPTY);
    tools.CustomValidator.nonEmptyString(req.planStartDate, coreErrorCodes.ERR_PLAN_START_DATE_IS_EMPTY);

    const careRes = await CarePlanRepository.findById(req.refCarePlanId);
    if (!careRes) { throw new models.CustomError(coreErrorCodes.ERR_REF_CARE_PLAN_ID_NOT_EXIST); }

    if (tools.CustomValidator.nonEmptyArray(req.serviceItems)) {
      // check serviceItems' itemIds are exist and calc. BC's total
      const { bcCost } = await _CarePlanController._bindServiceItems(req.serviceItems);

      // check bc cost
      if (!_CarePlanController._checkCost(bcCost, req.bcPayment.quota, req.bcPayment.excessOwnExpense)) {
        throw new models.CustomError(coreErrorCodes.ERR_BC_SERVICE_COST_OVER_QUOTA_AND_OWN_EXPENSE);
      }
    }

    // 1. bind mReq to ref. carePlan and 2. set planEndDate to ref. carePlan
    const obj = _CarePlanController._prepareObj(req, careRes);
    careRes.bind(obj).bindBaseInfo({ __cc, __sc });
    const res = await CarePlanRepository.create(careRes);
    await CarePlanRepository.updateById(req.refCarePlanId, { planEndDate: moment(req.planStartDate, dateFormat).subtract(1, 'd').format(dateFormat) });

    ctx.state.result = new models.CustomResult().withResult({ id: res.id });
    await next();
  }

  static async updateNewest(ctx, next) {
    const { carePlanId } = ctx.params;
    const { __vn, __cc, __sc } = ctx.state.baseInfo;
    const req = ctx.request.body;

    const careRes = await CarePlanRepository.findById(carePlanId);
    if (!careRes) { throw new models.CustomError(coreErrorCodes.ERR_CARE_PLAN_NOT_EXIST); }
    tools.CustomValidator.isEqual(careRes.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    // check is the newest
    if (careRes.planEndDate) { throw new models.CustomError(coreErrorCodes.ERR_PLAN_ID_IS_NOT_NEWEST); }

    // check planStartDate
    tools.CustomValidator.nonEmptyString(req.planStartDate, coreErrorCodes.ERR_PLAN_START_DATE_IS_EMPTY);
    const resList = await CarePlanRepository.findList({ caseId: careRes.caseId, planEndDate: { $nin: [null, ''] } });
    const maxDate = new Date(Math.max(...resList.map((element) => new Date(element.planStartDate))));
    if (moment(req.planStartDate, dateFormat).isSameOrBefore(maxDate)) { throw new models.CustomError(coreErrorCodes.ERR_PLAN_START_DATE_WRONG_VALUE); }

    if (tools.CustomValidator.nonEmptyArray(req.serviceItems)) {
      // check serviceItems' itemIds are exist and calc. BC's total
      const { bcCost } = await _CarePlanController._bindServiceItems(req.serviceItems);

      // check bc cost
      if (!_CarePlanController._checkCost(bcCost, req.bcPayment.quota, req.bcPayment.excessOwnExpense)) {
        throw new models.CustomError(coreErrorCodes.ERR_BC_SERVICE_COST_OVER_QUOTA_AND_OWN_EXPENSE);
      }
    }

    const obj = _CarePlanController._prepareObj(req, careRes);
    obj.__cc = __cc;
    obj.__sc = __sc;
    const res = await CarePlanRepository.updateById(carePlanId, obj);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL); }

    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = CarePlanController;
