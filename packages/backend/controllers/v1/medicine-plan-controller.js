/* eslint-disable object-curly-newline */
/* eslint-disable newline-per-chained-call */
/**
 * FeaturePath: 個案管理-計畫-用藥計畫-CRUD
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-plan-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-08-15 11:31:37 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { models, codes } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { ReadMedicinePlanListRequest, CreateMedicinePlanRequest, UpdateMedicinePlanRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { MedicineService } = require('@erpv3/app-core/application/service');
const { MedicinePlanRepository, CustomMedicineRepository } = require('@erpv3/app-core/infra/repositories');
const { coreErrorCodes, MedicinePlanEntity } = require('@erpv3/app-core/domain');
const MedicinePlanListResponse = require('./res-objects/medicine-plan-list-response');

class MedicinePlanController {
  static async _genMedUsedTime(companyId) {
    const defaultMedUsedTimePath = './packages/backend/configs/default/medicine-used-time.json';
    const data = await MedicineService.findMedUsedTime(companyId, defaultMedUsedTimePath);
    return data;
  }

  static async _takeMedData(reqMedicine) {
    const medIds = reqMedicine.map((m) => m.medicineId);
    const medList = await CustomMedicineRepository.findByIds(medIds);
    CustomValidator.isEqual(medIds.length, medList.length, coreErrorCodes.ERR_MEDICINE_NOT_FOUND);
    return medList;
  }

  static async create(ctx, next) {
    const { personId } = ctx.state.user;
    const { __cc, __sc, companyId } = ctx.state.baseInfo;
    const { cookie } = ctx.request.headers;
    const mReq = new CreateMedicinePlanRequest().bind(ctx.request.body).checkRequired();
    if (mReq.autoAddHospital) { await MedicineService.updateCommonName(mReq.companyId, 'hospital', [mReq.hospital], { __cc, __sc }, personId); }
    if (mReq.autoAddDoctor) { await MedicineService.updateCommonName(mReq.companyId, 'doctor', [mReq.doctor], { __cc, __sc }, personId); }

    // Take medicines' data
    const medList = await MedicinePlanController._takeMedData(mReq.medicines);

    // Take standard medicine useTime
    const medUsedTime = await MedicinePlanController._genMedUsedTime(mReq.companyId);

    const entity = new MedicinePlanEntity().bind(mReq).bindBaseInfo({ __cc, __sc }).bindCreator(personId).bindModifier(personId);
    const medPlanRes = await MedicineService.createPlanAndRecord(companyId, entity, medList, medUsedTime, cookie);

    ctx.state.result = new models.CustomResult().withResult({ id: medPlanRes.id });
    await next();
  }

  static async update(ctx, next) {
    const { medicinePlanId } = ctx.params;
    const { personId } = ctx.state.user;
    const { __cc, __sc, __vn, companyId } = ctx.state.baseInfo;
    const { cookie } = ctx.request.headers;
    const mReq = new UpdateMedicinePlanRequest().bind(ctx.request.body).checkRequired();

    const res = await MedicinePlanRepository.findById(medicinePlanId);
    if (!res) { throw new models.CustomError(coreErrorCodes.ERR_MEDICINE_PLAN_NOT_FOUND); }
    CustomValidator.isEqual(res.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    if (mReq.autoAddHospital) { await MedicineService.updateCommonName(companyId, 'hospital', [mReq.hospital], { __cc, __sc }, personId); }
    if (mReq.autoAddDoctor) { await MedicineService.updateCommonName(companyId, 'doctor', [mReq.doctor], { __cc, __sc }, personId); }

    // Take medicines' data
    const medList = await MedicinePlanController._takeMedData(mReq.medicines);

    res.bind(mReq).bindBaseInfo({ __cc, __sc }).bindCreator(personId).bindModifier(personId);

    const medUsedTime = await MedicinePlanController._genMedUsedTime(companyId);
    await MedicineService.updatePlanAndRecord(companyId, medicinePlanId, res, medList, medUsedTime, cookie);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async readList(ctx, next) {
    const mReq = new ReadMedicinePlanListRequest().bind(ctx.request.query).checkRequired().checkFilterDate();
    const resList = await MedicinePlanRepository.findByQBE(mReq);

    const response = new MedicinePlanListResponse();
    response.list = resList;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async read(ctx, next) {
    const { medicinePlanId } = ctx.params;

    const res = await MedicinePlanRepository.findById(medicinePlanId);
    if (!res) { throw new models.CustomError(coreErrorCodes.ERR_MEDICINE_PLAN_NOT_FOUND); }
    ctx.state.result = new models.CustomResult().withResult(res.toView());
    await next();
  }

  static async delete(ctx, next) {
    const { medicinePlanId } = ctx.params;
    const { personId } = ctx.state.operator;
    const { __cc, __sc } = ctx.state.baseInfo;

    const res = await MedicinePlanRepository.findById(medicinePlanId);
    if (!res) { throw new models.CustomError(coreErrorCodes.ERR_MEDICINE_PLAN_NOT_FOUND); }

    await MedicineService.deletePlanAndRecord(medicinePlanId, { __cc, __sc }, personId);

    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = MedicinePlanController;
