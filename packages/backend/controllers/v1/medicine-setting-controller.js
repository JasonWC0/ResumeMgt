/* eslint-disable object-curly-newline */
/**
 * FeaturePath: 經營管理-用藥管理-用藥設定-常用時間RU
 * FeaturePath: 經營管理-用藥管理-用藥設定-常用名稱CRUD
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-setting-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-08-08 02:17:57 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { models, tools } = require('@erpv3/app-common');
const { MedicineService } = require('@erpv3/app-core/application/service');
const { UpdateMedicineUsedTimeRequest, UpdateCommonlyUsedNameRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { MedicineUsedTimeRepository, CommonlyUsedNameRepository } = require('@erpv3/app-core/infra/repositories');
const { coreErrorCodes, commonlyUsedNameCodes, MedicineUsedTimeEntity, CommonlyUsedNameEntity } = require('@erpv3/app-core/domain');
const CommonlyUsedNameListResponse = require('./res-objects/commonly-used-name-list-response');

const MedicineCommonNameList = [commonlyUsedNameCodes.hospital, commonlyUsedNameCodes.doctor];

class MedicineSettingController {
  static async readUsedTime(ctx, next) {
    const { companyId } = ctx.request.query;
    if (!companyId) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_ID_EMPTY); }

    const defaultMedUsedTimePath = './packages/backend/configs/default/medicine-used-time.json';
    const response = await MedicineService.findMedUsedTime(companyId, defaultMedUsedTimePath);
    ctx.state.result = new models.CustomResult().withResult(response);
    await next();
  }

  static async updateUsedTime(ctx, next) {
    const { __cc, __sc, companyId } = ctx.state.baseInfo;
    const { personId } = ctx.state.user;
    const mReq = new UpdateMedicineUsedTimeRequest().bind(ctx.request.body).checkRequired();

    tools.CustomValidator.isEqual(companyId, mReq.companyId, coreErrorCodes.ERR_COMPANY_ID_IS_DIFF);

    const entity = new MedicineUsedTimeEntity().bind(mReq).bindBaseInfo({ __cc, __sc }).bindModifier(personId);

    const exist = await MedicineUsedTimeRepository.findByCompanyId(mReq.companyId);
    if (!exist) {
      entity.bindCreator(personId);
    }
    await MedicineUsedTimeRepository.updateByCompanyId(mReq.companyId, entity);

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async readUsedNameList(ctx, next) {
    const { companyId, type } = ctx.request.query;
    if (!companyId) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_ID_EMPTY); }

    let _type = [];
    if (tools.CustomValidator.nonEmptyString(type)) {
      const typeList = type.split(',').filter((t) => MedicineCommonNameList.includes(t));
      _type = typeList;
    }
    if (!tools.CustomValidator.nonEmptyArray(_type)) { _type = MedicineCommonNameList; }

    const resList = await CommonlyUsedNameRepository.findByCompanyId(companyId, _type);
    const response = new CommonlyUsedNameListResponse();
    response.list = resList;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async createUsedNameList(ctx, next) {
    const { __cc, __sc, companyId } = ctx.state.baseInfo;
    const { personId } = ctx.state.user;
    const { type } = ctx.params;
    if (!MedicineCommonNameList.includes(type)) { throw new models.CustomError(coreErrorCodes.ERR_MEDICINE_USED_NAME_TYPE_NOT_EXIST); }
    const mReq = new UpdateCommonlyUsedNameRequest().bind(ctx.request.body).checkRequired();

    tools.CustomValidator.isEqual(companyId, mReq.companyId, coreErrorCodes.ERR_COMPANY_ID_IS_DIFF);

    await MedicineService.updateCommonName(mReq.companyId, type, mReq.name, { __cc, __sc }, personId);

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async deleteUsedNameList(ctx, next) {
    const { __cc, __sc, companyId } = ctx.state.baseInfo;
    const { personId } = ctx.state.user;
    const { type } = ctx.params;
    if (!MedicineCommonNameList.includes(type)) { throw new models.CustomError(coreErrorCodes.ERR_MEDICINE_USED_NAME_TYPE_NOT_EXIST); }
    const mReq = new UpdateCommonlyUsedNameRequest().bind(ctx.request.query).checkRequired();

    tools.CustomValidator.isEqual(companyId, mReq.companyId, coreErrorCodes.ERR_COMPANY_ID_IS_DIFF);

    const entity = new CommonlyUsedNameEntity().bind(mReq).bindBaseInfo({ __cc, __sc }).bindModifier(personId);

    const exist = await CommonlyUsedNameRepository.findByCompanyId(mReq.companyId, [type]);
    if (tools.CustomValidator.nonEmptyArray(exist)) {
      const tempName = exist[0].name.filter((n) => !mReq.name.includes(n));
      entity.withName(tempName);
      await CommonlyUsedNameRepository.updateByCompanyId(mReq.companyId, type, entity);
    }

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async replaceUsedNameList(ctx, next) {
    const { __cc, __sc, companyId } = ctx.state.baseInfo;
    const { personId } = ctx.state.user;
    const { type } = ctx.params;
    if (!MedicineCommonNameList.includes(type)) { throw new models.CustomError(coreErrorCodes.ERR_MEDICINE_USED_NAME_TYPE_NOT_EXIST); }
    const mReq = new UpdateCommonlyUsedNameRequest().bind(ctx.request.body).checkReplaceRequired();

    tools.CustomValidator.isEqual(companyId, mReq.companyId, coreErrorCodes.ERR_COMPANY_ID_IS_DIFF);

    const entity = new CommonlyUsedNameEntity().bind(mReq).bindBaseInfo({ __cc, __sc }).bindModifier(personId);

    const exist = await CommonlyUsedNameRepository.findByCompanyId(mReq.companyId, [type]);
    if (!tools.CustomValidator.nonEmptyArray(exist)) { entity.bindCreator(personId); }
    await CommonlyUsedNameRepository.updateByCompanyId(mReq.companyId, type, entity);

    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = MedicineSettingController;
