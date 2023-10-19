/**
 * FeaturePath: 經營管理-人事管理-員工資料-新增人員資料
 * FeaturePath: 經營管理-人事管理-員工資料-編輯人員資料
 * FeaturePath: 經營管理-人事管理-員工資料-查詢人員資料
 * FeaturePath: 經營管理-人事管理-員工資料-人員姓名模糊搜尋
 * FeaturePath: 經營管理-人事管理-員工資料-編輯人員資料(數據同步使用)
 * FeaturePath: 經營管理-人事管理-員工資料-刪除人員資料
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { customLogger, CustomValidator } = require('@erpv3/app-common/custom-tools');
const { models, codes } = require('@erpv3/app-common');
const reqobjs = require('@erpv3/app-core/application/contexts/req-objects');
const coreRepo = require('@erpv3/app-core/infra/repositories');
const {
  coreErrorCodes,
  accountTypeCodes,
  PersonEntity,
  EmployeeObject,
  CustomerObject,
  CaseHealthFileObject,
} = require('@erpv3/app-core/domain');
const fsExtra = require('fs-extra');

async function _updatePersonInfo(oPerson, mReq, ctx) {
  const oCorporation = await coreRepo.CorporationRepository.findById(oPerson.corpId);
  if (!oCorporation) {
    customLogger.info(`Corporation ${mReq.corpId} not found`);
    throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND);
  }

  const keys = await fsExtra.readJson(oCorporation.__enc.provider);
  const secretKey = keys[oCorporation.__enc.keyId];
  oPerson
    .bind(mReq.dataObj)
    .bindBaseInfo(ctx.state.baseInfo)
    .bindModifier((ctx.state.user && ctx.state.user.personId) || null)
    .withKey(secretKey.key)
    .withIv(secretKey.iv)
    .encryption();

  const res = await coreRepo.PersonRepository.updateById(oPerson.id, oPerson);
  if (!res) { throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL); }
  customLogger.info(`Create ${res.id} person data success`);
}

/**
 * @class
 * @classdesc Person Api Controller
 */
class PersonController {
  static async createPerson(ctx, next) {
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new reqobjs.CreatePersonRequest()
      .bind(ctx.request.body)
      .checkRequired();
    const oCorporation = await coreRepo.CorporationRepository.findById(mReq.corpId);
    if (!oCorporation) {
      customLogger.info(`Corporation ${mReq.corpId} not found`);
      throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND);
    }

    let oPerson = await coreRepo.PersonRepository.findByPersonalIdAndCorpId(mReq.personalId, mReq.corpId);
    if (oPerson) {
      customLogger.info(`Person ${mReq.personalId} already exists in this ${mReq.corpId} corporation`);
      throw new models.CustomError(coreErrorCodes.ERR_PERSON_ALREADY_EXISTS);
    }

    const keys = await fsExtra.readJson(oCorporation.__enc.provider);
    const secretKey = keys[oCorporation.__enc.keyId];
    oPerson = await new PersonEntity()
      .bind(mReq)
      .bindBaseInfo({ __cc, __sc })
      .bindCreator((ctx.state.user && ctx.state.user.personId) || null)
      .withKey(secretKey.key)
      .withIv(secretKey.iv)
      .encryption();
    const res = await coreRepo.PersonRepository.create(oPerson);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL); }
    customLogger.info(`Create ${res.id} person data success`);
    ctx.state.result = new models.CustomResult().withResult({
      personId: res.id,
    });
    await next();
  }

  static async readPerson(ctx, next) {
    const { personId } = ctx.params;
    customLogger.info(`Find ${personId} person data`);
    const oPerson = await coreRepo.PersonRepository.findById(personId);
    if (!oPerson) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    const oCorporation = await coreRepo.CorporationRepository.findById(oPerson.corpId);
    if (!oCorporation) {
      customLogger.info(`Corporation ${oPerson.corpId} not found`);
      throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND);
    }

    const keys = await fsExtra.readJson(oCorporation.__enc.provider);
    const secretKey = keys[oCorporation.__enc.keyId];
    await oPerson
      .withKey(secretKey.key)
      .withIv(secretKey.iv)
      .decryption();
    const res = oPerson.toView();
    const oAccount = await coreRepo.AccountRepository.findByCorpAndPerson(oPerson.corpId, oPerson.id, accountTypeCodes.employee);
    res.account = oAccount ? oAccount.account : '';
    if (!CustomValidator.isEqual(oPerson.employee, new EmployeeObject())) {
      res.serviceItemQualification = oPerson.employee.serviceItemQualification;
      res.contact = oPerson.employee.contact.toView();
    }
    if (res.customer && oPerson.customer !== new CustomerObject()) {
      const newestCarePlan = await coreRepo.CarePlanRepository.findNewestByPersonId(oPerson.id);
      const hf = new CaseHealthFileObject();
      if (newestCarePlan) hf.bind(newestCarePlan);
      res.customer.healthFile = hf.responseInfo();
    }
    ctx.state.result = new models.CustomResult().withResult(res);
    await next();
  }

  static async updatePerson(ctx, next) {
    const { personId } = ctx.params;
    const { __vn } = ctx.state.baseInfo;

    customLogger.info(`Find ${personId} person data`);
    const oPerson = await coreRepo.PersonRepository.findById(personId);
    if (!oPerson) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    CustomValidator.isEqual(oPerson.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);
    const mReq = new reqobjs.UpdatePersonRequest()
      .bind(ctx.request.body)
      .checkRequired();

    await _updatePersonInfo(oPerson, mReq, ctx);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async updatePersonForSync(ctx, next) {
    const { personId } = ctx.params;
    const { __vn } = ctx.state.baseInfo;

    customLogger.info(`Update ${personId} person data for sync`);
    const oPerson = await coreRepo.PersonRepository.findById(personId);
    if (!oPerson) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    const mReq = new reqobjs.UpdatePersonForSyncRequest()
      .bind(ctx.request.body)
      .checkRequired();

    CustomValidator.isEqual(oPerson.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    await _updatePersonInfo(oPerson, mReq, ctx);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async deletePerson(ctx, next) {
    const { personId } = ctx.params;

    customLogger.info(`Find ${personId} person data`);
    const res = await coreRepo.PersonRepository.findById(personId);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    res.bindBaseInfo(ctx.state.baseInfo).bindModifier(ctx.state.user.personId);
    await coreRepo.PersonRepository.deletePerson(res);
    ctx.state.result = new models.CustomResult().withResult();
    await next();
  }

  static async fuzzySearchPerson(ctx, next) {
    const mReq = new reqobjs.FuzzySearchPersonRequest()
      .bind(ctx.request.query)
      .checkRequired();

    customLogger.info(`Fuzzy search employees whose name contain ${mReq.name} in ${mReq.corpId} corporation`);
    const docs = await coreRepo.PersonRepository.fuzzySearchByCorpIdAndName(mReq.corpId, mReq.name);
    if (!CustomValidator.nonEmptyArray(docs)) {
      ctx.state.result = new models.CustomResult().withResult(docs);
      await next();
      return;
    }

    const oCorporation = await coreRepo.CorporationRepository.findById(mReq.corpId);
    if (!oCorporation) {
      customLogger.info(`Corporation ${mReq.corpId} not found`);
      throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND);
    }

    const keys = await fsExtra.readJson(oCorporation.__enc.provider);
    const secretKey = keys[oCorporation.__enc.keyId];

    const resArr = [];
    for await (const d of docs) {
      await d.withKey(secretKey.key)
        .withIv(secretKey.iv)
        .decryption();
      const cases = await coreRepo.CaseRepository.findCaseByPersonId(d.id);
      const caseServiceStatuses = cases.map((c) => ({
        caseId: c.id,
        companyId: c.companyId,
        HC: c.hc ? c.hc.valid : null,
        DC: c.dc ? c.dc.valid : null,
        RC: c.rc ? c.rc.valid : null,
        ACM: c.acm ? c.acm.valid : null,
        GH: c.gh ? c.gh.valid : null,
      }));

      resArr.push({
        id: d.id,
        name: d.name,
        personalId: d.personalId,
        mobile: d.mobile,
        employeeCompanies: d.employee.comPersonMgmt.map((c) => c.companyId),
        caseCompanies: await coreRepo.CaseRepository.distinctByPersonId(d.id),
        serviceStatuses: caseServiceStatuses,
        vn: d.__vn,
      });
    }
    ctx.state.result = new models.CustomResult().withResult(resArr);
    await next();
  }
}

module.exports = PersonController;
