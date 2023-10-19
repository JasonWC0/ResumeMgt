/* eslint-disable object-curly-newline */
/* eslint-disable newline-per-chained-call */
/**
 * FeaturePath: 住宿式服務-排班-排班管理-班別CRUD
 * FeaturePath: 住宿式服務-排班-排班管理-查詢班別使用中
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: nursing-shift-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-10-13 02:47:18 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { models, codes } = require('@erpv3/app-common');
const { CustomValidator, CustomRegex, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { CreateNursingShiftRequest, UpdateNursingShiftRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { NursingShiftScheduleService } = require('@erpv3/app-core/application/service');
const { NursingShiftRepository, NursingShiftScheduleRepository } = require('@erpv3/app-core/infra/repositories');
const { coreErrorCodes, NursingShiftEntity } = require('@erpv3/app-core/domain');
const NursingShiftListResponse = require('./res-objects/nursing-shift-list-response');

class NursingShiftController {
  static async readList(ctx, next) {
    const { f } = ctx.request.query;
    const { companyId } = ctx.state.baseInfo;
    const _f = CustomUtils.convertBoolean(f, true);

    const entities = await NursingShiftRepository.findByCompanyId(companyId, _f);
    const response = new NursingShiftListResponse();
    response.list = entities;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async read(ctx, next) {
    const { nursingShiftId } = ctx.params;
    const entity = await NursingShiftRepository.findById(nursingShiftId);
    if (!entity) { throw new models.CustomError(coreErrorCodes.ERR_NURSING_SHIFT_NOT_EXIST); }

    ctx.state.result = new models.CustomResult().withResult(entity.toView());
    await next();
  }

  static async create(ctx, next) {
    const { personId } = ctx.state.user;
    const { __cc, __sc, companyId } = ctx.state.baseInfo;
    const mReq = new CreateNursingShiftRequest().bind(ctx.request.body).checkRequired();
    if (!CustomValidator.isEqual(companyId, mReq.companyId)) { throw new models.CustomError(coreErrorCodes.ERR_USER_COMPANY_ID_IS_DIFF); }

    const checkCode = await NursingShiftRepository.findByQbe({ companyId: mReq.companyId, code: mReq.code });
    if (CustomValidator.nonEmptyArray(checkCode)) { throw new models.CustomError(coreErrorCodes.ERR_NURSING_SHIFT_CODE_IS_EXIST); }

    const entity = new NursingShiftEntity().bind(mReq).bindBaseInfo({ __cc, __sc }).bindCreator(personId).bindModifier(personId);
    await NursingShiftRepository.create(entity);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async update(ctx, next) {
    const { nursingShiftId } = ctx.params;
    const { personId } = ctx.state.user;
    const { __cc, __sc, __vn } = ctx.state.baseInfo;
    const mReq = new UpdateNursingShiftRequest().bind(ctx.request.body).checkRequired();

    const entity = await NursingShiftRepository.findById(nursingShiftId);
    if (!entity) { throw new models.CustomError(coreErrorCodes.ERR_NURSING_SHIFT_NOT_EXIST); }
    CustomValidator.isEqual(entity.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    const checkCode = await NursingShiftRepository.findByQbe({ companyId: mReq.companyId, code: mReq.code });
    const _ids = checkCode.filter((e) => (e.id !== nursingShiftId));
    if (CustomValidator.nonEmptyArray(_ids)) { throw new models.CustomError(coreErrorCodes.ERR_NURSING_SHIFT_CODE_IS_EXIST); }

    // prepare nursingShift entity
    entity.bind(mReq).bindBaseInfo({ __cc, __sc }).bindModifier(personId);

    // update nursingShift and nursingShiftSchedule in future
    const warningData = await NursingShiftScheduleService.updateByNursingShift(entity, { __cc, __sc }, personId);
    ctx.state.result = new models.CustomResult().withResult({ hourWarning: warningData });
    await next();
  }

  static async delete(ctx, next) {
    const { nursingShiftId } = ctx.params;
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;

    const entity = await NursingShiftRepository.findById(nursingShiftId);
    if (!entity) { throw new models.CustomError(coreErrorCodes.ERR_NURSING_SHIFT_NOT_EXIST); }

    await NursingShiftScheduleService.deleteByNursingShift(nursingShiftId, { __cc, __sc }, personId);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async isUsed(ctx, next) {
    const { nursingShiftId } = ctx.params;
    const { date } = ctx.request.query;
    if (!CustomValidator.nonEmptyString(date)) { throw new models.CustomError(coreErrorCodes.ERR_DATE_IS_EMPTY); }
    if (!CustomRegex.dateFormat(date)) { throw new models.CustomError(coreErrorCodes.ERR_DATE_WRONG_FORMAT); }

    const res = await NursingShiftScheduleRepository.findByQbe({ date: { $gte: date }, nursingShiftId });
    ctx.state.result = new models.CustomResult().withResult({ isUsed: res.length > 0 });
    await next();
  }
}

module.exports = NursingShiftController;
