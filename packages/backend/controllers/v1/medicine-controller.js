/* eslint-disable newline-per-chained-call */
/* eslint-disable no-case-declarations */
/**
 * FeaturePath: 經營管理-用藥管理-藥品管理-CRUD
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-08-09 04:08:59 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { models, codes } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { UpdateCustomMedicineRequest, CreateCustomMedicineRequest, ReadMedicineRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { MedicineService } = require('@erpv3/app-core/application/service');
const { CustomMedicineRepository, CompanyRepository } = require('@erpv3/app-core/infra/repositories');
const { coreErrorCodes, CustomMedicineEntity, customMedicineCategoryCodes } = require('@erpv3/app-core/domain');
const MedicineListResponse = require('./res-objects/medicine-list-response');

const MedCategoryMap = {
  custom: 'custom',
  shared: 'shared',
};

class MedicineController {
  static async readList(ctx, next) {
    const { category } = ctx.params;
    if (!Object.values(MedCategoryMap).includes(category)) { throw new models.CustomError(coreErrorCodes.ERR_CUSTOM_MEDICINE_CATEGORY_NOT_EXIST); }
    const mReq = new ReadMedicineRequest().bind(ctx.request.query).checkRequired();

    let total = 0;
    let resList = [];
    switch (category) {
      case MedCategoryMap.custom:
        mReq.setOrder(category);
        resList = await CustomMedicineRepository.findByQBE(mReq);
        total = await CustomMedicineRepository.countByQBE(mReq);
        break;
      case MedCategoryMap.shared:
        const res = await MedicineService.findListFromNHIMedService(mReq);
        total = res.total;
        resList = res.data;
        break;
      default:
        throw new models.CustomError(coreErrorCodes.ERR_CUSTOM_MEDICINE_CATEGORY_NOT_EXIST);
    }

    const response = new MedicineListResponse();
    response.reqCategory = category;
    response.total = total;
    response.list = resList;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async read(ctx, next) {
    const { category, medicineId } = ctx.params;
    if (!Object.values(MedCategoryMap).includes(category)) { throw new models.CustomError(coreErrorCodes.ERR_CUSTOM_MEDICINE_CATEGORY_NOT_EXIST); }

    let res = null;
    switch (category) {
      case MedCategoryMap.custom:
        res = await CustomMedicineRepository.findById(medicineId);
        break;
      case MedCategoryMap.shared:
        throw new models.CustomError(codes.errorCodes.ERR_NOT_IMPLEMENT);
      default:
        throw new models.CustomError(coreErrorCodes.ERR_CUSTOM_MEDICINE_CATEGORY_NOT_EXIST);
    }

    if (!res) { throw new models.CustomError(coreErrorCodes.ERR_MEDICINE_NOT_FOUND); }
    ctx.state.result = new models.CustomResult().withResult(res.toView());
    await next();
  }

  static async update(ctx, next) {
    const { medicineId } = ctx.params;
    const { personId } = ctx.state.user;
    const { __vn, __cc, __sc } = ctx.state.baseInfo;
    const mReq = new UpdateCustomMedicineRequest().bind(ctx.request.body).checkRequired();

    const res = await CustomMedicineRepository.findById(medicineId);
    if (!res) { throw new models.CustomError(coreErrorCodes.ERR_MEDICINE_NOT_FOUND); }
    CustomValidator.isEqual(res.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    res.bind(mReq).bindModifier(personId).bindBaseInfo({ __cc, __sc });
    await CustomMedicineRepository.updateById(medicineId, res);

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async create(ctx, next) {
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new CreateCustomMedicineRequest().bind(ctx.request.body).checkRequired();

    const companyRes = await CompanyRepository.findById(mReq.companyId);
    if (!companyRes) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND); }

    const entity = new CustomMedicineEntity().bind(mReq).bindBaseInfo({ __cc, __sc }).bindCreator(personId).bindModifier(personId);
    switch (mReq.category) {
      case customMedicineCategoryCodes.shared:
        const exist = await CustomMedicineRepository.findOneByDrugOrAtcCode(mReq.companyId, mReq.drugCode);
        if (exist) { throw new models.CustomError(coreErrorCodes.ERR_CUSTOM_MEDICINE_DRUG_CODE_IS_EXIST); }
        break;
      case customMedicineCategoryCodes.custom:
        const drugCode = await CustomMedicineRepository.generateDrugCode(mReq.companyId);
        entity.withDrugCode(drugCode);
        break;
      default:
        break;
    }

    const res = await CustomMedicineRepository.create(entity);
    ctx.state.result = new models.CustomResult().withResult({ id: res.id });
    await next();
  }

  static async delete(ctx, next) {
    const { medicineId } = ctx.params;
    const { personId } = ctx.state.user;

    const res = await CustomMedicineRepository.findById(medicineId);
    if (!res) { throw new models.CustomError(coreErrorCodes.ERR_MEDICINE_NOT_FOUND); }

    await CustomMedicineRepository.delete(medicineId, personId);

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async updateField(ctx, next) {
    const { medicineId, field } = ctx.params;
    const { personId } = ctx.state.user;
    const { __vn, __cc, __sc } = ctx.state.baseInfo;
    const obj = new UpdateCustomMedicineRequest().checkUniField(field, ctx.request.body.data);

    const res = await CustomMedicineRepository.findById(medicineId);
    if (!res) { throw new models.CustomError(coreErrorCodes.ERR_MEDICINE_NOT_FOUND); }
    CustomValidator.isEqual(res.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    res.bind(obj).bindModifier(personId).bindBaseInfo({ __cc, __sc });
    await CustomMedicineRepository.updateById(medicineId, res);

    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = MedicineController;
