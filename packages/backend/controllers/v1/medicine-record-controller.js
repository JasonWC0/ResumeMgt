/* eslint-disable newline-per-chained-call */
/* eslint-disable object-curly-newline */
/**
 * FeaturePath: 經營管理-系統管理-用藥提醒-RU
 * FeaturePath: 經營管理-用藥管理-用藥紀錄-RU
 * FeaturePath: 個案管理-紀錄-用藥紀錄-RU
 * FeaturePath: 個案管理-紀錄-用藥紀錄-v25個案排班串接
 * FeaturePath: 個案管理-紀錄-用藥紀錄-v25個案排班狀態串接
 * FeaturePath: 個案管理-紀錄-用藥紀錄-v25個案狀態串接
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-record-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-08-24 10:35:11 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */
const fsExtra = require('fs-extra');
const { models } = require('@erpv3/app-common');
const { customLogger, CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { ReadMedicineRecordListRequest, UpdateMedicineRecordRequest, UpdateMedicineRecordBatchScheduleRequest,
  UpdateMedicineRecordBatchStatusRequest,
} = require('@erpv3/app-core/application/contexts/req-objects');
const { MedicineService } = require('@erpv3/app-core/application/service');
const { MedicineRecordRepository, CustomMedicineRepository, CompanyRepository, CorporationRepository, CaseRepository } = require('@erpv3/app-core/infra/repositories');
const { coreErrorCodes, restfulMethodCodes } = require('@erpv3/app-core/domain');
const MedicineRecordListResponse = require('./res-objects/medicine-record-list-response');
const MedicineRecordCaseListResponse = require('./res-objects/medicine-record-case-list-response');

const ListField = {
  caseId: 'caseId',
};

async function _takeCorpSecretKey(corpId) {
  const corpEntity = await CorporationRepository.findById(corpId);
  if (!corpEntity) {
    customLogger.info(`Corporation ${corpId} not found`);
    throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND);
  }
  const keys = await fsExtra.readJson(corpEntity.__enc.provider);
  return keys[corpEntity.__enc.keyId];
}

class MedicineRecordController {
  static async _genMedUsedTime(companyId) {
    const defaultMedUsedTimePath = './packages/backend/configs/default/medicine-used-time.json';
    const data = await MedicineService.findMedUsedTime(companyId, defaultMedUsedTimePath);
    return data;
  }

  static async _takeMedData(reqMedicine) {
    const medIds = reqMedicine.map((m) => m.medicineId);
    const medList = await CustomMedicineRepository.findByIds(medIds);
    CustomValidator.isEqual(medIds.length, medList.length, coreErrorCodes.ERR_MEDICINE_NOT_FOUND);
  }

  static async readListFunc(mReq) {
    const resList = await MedicineRecordRepository.findByQBE(mReq);

    let response = [];
    switch (mReq.field) {
      case ListField.caseId: {
        const companyRes = await CompanyRepository.findById(mReq.companyId);
        if (!companyRes) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND); }

        const caseList = CustomValidator.nonEmptyArray(resList) ? await CaseRepository.findCaseByIds(CustomUtils.uniqueArray(resList.map((res) => (res.caseId)))) : [];
        if (caseList.length > 0) {
          const secretKey = await _takeCorpSecretKey(companyRes.corpId);
          for await (const _case of caseList) {
            await _case.personObject.withKey(secretKey.key).withIv(secretKey.iv).decryption();
          }
          const medRecordCaseRes = new MedicineRecordCaseListResponse();
          medRecordCaseRes.list = caseList;
          response = medRecordCaseRes.toView();
        }
        break;
      }
      default: {
        const medRecordRes = new MedicineRecordListResponse();
        medRecordRes.list = resList;
        response = medRecordRes.toView();
        break;
      }
    }
    return response;
  }

  static async update(ctx, next) {
    const { medicineRecordId } = ctx.params;
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new UpdateMedicineRecordRequest().bind(ctx.request.body).checkRequired();

    const res = await MedicineRecordRepository.findById(medicineRecordId);
    if (!res) { throw new models.CustomError(coreErrorCodes.ERR_MEDICINE_RECORD_NOT_FOUND); }

    // Take medicines' data
    await MedicineRecordController._takeMedData(mReq.medicines);
    const reqMedList = CustomUtils.deepCopy(mReq.medicines);
    mReq.medicines = res.medicines;
    mReq.medicines.forEach((m) => {
      const newData = reqMedList.find((med) => med.medicineId === m.medicineId);
      m.isUsed = newData ? newData.isUsed : false;
    });

    res.bind(mReq).setStatus().bindBaseInfo({ __cc, __sc }).bindModifier(personId);
    await MedicineRecordRepository.update(medicineRecordId, res);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async readList(ctx, next) {
    const mReq = new ReadMedicineRecordListRequest().bind(ctx.request.query)
      .checkRequired()
      .checkFilterDate()
      .withStatus();
    const response = await MedicineRecordController.readListFunc(mReq);
    ctx.state.result = new models.CustomResult().withResult(response);
    await next();
  }

  static async read(ctx, next) {
    const { medicineRecordId } = ctx.params;

    const res = await MedicineRecordRepository.findById(medicineRecordId);
    if (!res) { throw new models.CustomError(coreErrorCodes.ERR_MEDICINE_RECORD_NOT_FOUND); }
    ctx.state.result = new models.CustomResult().withResult(res.toView());
    await next();
  }

  // For Luna2.5
  static async batchCaseSchedule(ctx, next) {
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new UpdateMedicineRecordBatchScheduleRequest().bind(ctx.request.body).checkRequired();

    // Take standard medicine useTime
    const medUsedTime = await MedicineRecordController._genMedUsedTime(mReq.companyId);

    const { companyId, caseId, schedules, oldSchedules, personId } = mReq;
    switch (mReq.method) {
      case restfulMethodCodes.Create: {
        if (!CustomValidator.nonEmptyArray(schedules)) { break; }
        await MedicineService.createRecordBySchedules(companyId, caseId, schedules, medUsedTime, { __cc, __sc }, personId);
        break;
      }
      case restfulMethodCodes.Update: {
        // delete
        if (CustomValidator.nonEmptyArray(oldSchedules)) {
          await MedicineService.deleteRecordBySchedules(caseId, oldSchedules, { __cc, __sc }, personId);
        }
        // create
        if (!CustomValidator.nonEmptyArray(schedules)) { break; }
        await MedicineService.createRecordBySchedules(companyId, caseId, schedules, medUsedTime, { __cc, __sc }, personId);
        break;
      }
      case restfulMethodCodes.Delete: {
        // delete
        if (!CustomValidator.nonEmptyArray(schedules)) { break; }
        await MedicineService.deleteRecordBySchedules(caseId, schedules, { __cc, __sc }, personId);
        break;
      }
      default:
        break;
    }
    ctx.state.result = new models.CustomResult();
    await next();
  }

  // For Luna2.5
  static async batchScheduleStatus(ctx, next) {
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new UpdateMedicineRecordBatchStatusRequest().bind(ctx.request.body).checkRequired('schedule');
    const { caseId, date, scheduleStatus, personId } = mReq;
    await MedicineService.updateRecordStatus(caseId, date, null, scheduleStatus, { __cc, __sc }, personId);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  // For Luna2.5
  static async batchCaseStatus(ctx, next) {
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new UpdateMedicineRecordBatchStatusRequest().bind(ctx.request.body).checkRequired('case');
    const { caseId, startDate, endDate, caseStatus, personId } = mReq;
    await MedicineService.updateRecordStatus(caseId, startDate, endDate, caseStatus, { __cc, __sc }, personId);
    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = MedicineRecordController;
