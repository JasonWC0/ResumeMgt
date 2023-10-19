/**
 * FeaturePath: 個案管理-基本資料-個案資訊-新增顧客資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-編輯顧客資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-查詢顧客資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-刪除顧客資訊
 * FeaturePath: 個案管理-基本資料-個案資訊-查詢顧客清單
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
  CustomerObject,
} = require('@erpv3/app-core/domain');
const fsExtra = require('fs-extra');

/**
 * @class
 * @classdesc Customer Api Controller
 */
class CustomerController {
  static async createCustomer(ctx, next) {
    const { personId } = ctx.params;

    const mReq = new reqobjs.CreateCustomerRequest()
      .bind(ctx.request.body)
      .checkRequired();

    customLogger.info(`Find ${personId} person data...`);
    const oPerson = await coreRepo.PersonRepository.findById(personId);
    if (!oPerson) {
      customLogger.info(`Person ${personId} not found`);
      throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND);
    }

    oPerson.withCustomer(mReq).bindBaseInfo(ctx.state.baseInfo);
    const res = await coreRepo.PersonRepository.updateById(oPerson.id, oPerson);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL); }
    customLogger.info(`Create ${res.id} Customer data success`);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async readCustomer(ctx, next) {
    const { personId } = ctx.params;

    customLogger.info(`Find ${personId} customer data`);

    const oPerson = await coreRepo.PersonRepository.findById(personId);
    if (!oPerson) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    if (CustomValidator.isEqual(oPerson.customer, new CustomerObject())) { throw new models.CustomError(coreErrorCodes.ERR_CUSTOMER_DATA_EMPTY); }

    const oCorporation = await coreRepo.CorporationRepository.findById(oPerson.corpId);
    if (!oCorporation) {
      customLogger.info(`Corporation ${personId.corpId} not found`);
      throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND);
    }

    const keys = await fsExtra.readJson(oCorporation.__enc.provider);
    const serectKey = keys[oCorporation.__enc.keyId];
    await oPerson
      .withKey(serectKey.key)
      .withIv(serectKey.iv)
      .decryption();

    const resObj = {
      name: oPerson.name,
      nickname: oPerson.nickname,
      personId: oPerson.id,
      nationality: oPerson.nationality,
      birthDate: oPerson.birthDate,
      gender: oPerson.gender,
      languages: oPerson.languages,
      otherLanguage: oPerson.otherLanguage,
      education: oPerson.education,
      disability: oPerson.disability,
      aborigines: oPerson.aborigines,
      aboriginalRace: oPerson.aboriginalRace,
      mobile: oPerson.mobile,
      phoneH: oPerson.phoneH,
      phoneO: oPerson.phoneO,
      extNumber: oPerson.extNumber,
      email: oPerson.email,
      lineId: oPerson.lineId,
      facebook: oPerson.facebook,
      registerPlace: oPerson.registerPlace,
      residencePlace: oPerson.residencePlace,
      photo: oPerson.photo,
      cusRoles: oPerson.customer.cusRoles,
      contacts: oPerson.customer.contacts,
      agent: oPerson.customer.agent,
      caregivers: oPerson.customer.caregivers,
      vn: oPerson.__vn,
    };
    ctx.state.result = new models.CustomResult().withResult(resObj);
    await next();
  }

  static async listCustomer(ctx, next) {
    const mReq = new reqobjs.ListCustomerRequest()
      .bind(ctx.request.query)
      .checkRequired();

    const oCorporation = await coreRepo.CorporationRepository.findById(mReq.corpId);
    if (!oCorporation) {
      customLogger.info(`Corporation ${mReq.corpId} not found`);
      throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND);
    }

    customLogger.info(`List customer data by ${mReq.corpId} corporation`);
    const oPersons = await coreRepo.CustomerRepository.listByQbe(mReq);
    const resArray = [];
    if (!CustomValidator.nonEmptyArray(oPersons)) {
      ctx.state.result = new models.CustomResult().withResult(resArray);
      await next();
      return;
    }

    const keys = await fsExtra.readJson(oCorporation.__enc.provider);
    const serectKey = keys[oCorporation.__enc.keyId];
    for await (const p of oPersons) {
      await p
        .withKey(serectKey.key)
        .withIv(serectKey.iv)
        .decryption();
      resArray.push({
        personId: p.id,
        name: p.name,
        personalId: p.personalId,
        birthDate: p.birthDate,
        gender: p.gender,
        cusRoles: p.cusRoles,
        vn: p.__vn,
      });
    }
    ctx.state.result = new models.CustomResult().withResult(resArray);
    await next();
  }

  static async updateCustomer(ctx, next) {
    const { personId } = ctx.params;
    const { __vn } = ctx.state.baseInfo;
    const mReq = new reqobjs.UpdateCustomerRequest()
      .bind(ctx.request.body)
      .checkRequired();

    customLogger.info(`Find ${personId} person data...`);
    const oPerson = await coreRepo.PersonRepository.findById(personId);
    if (!oPerson) {
      customLogger.info(`Person ${personId} not found`);
      throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND);
    }

    CustomValidator.isEqual(oPerson.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    const uCustomer = oPerson.customer;
    oPerson.withCustomer(uCustomer.bind(mReq.dataObj)).bindBaseInfo(ctx.state.baseInfo);
    const res = await coreRepo.PersonRepository.updateById(oPerson.id, oPerson);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL); }
    customLogger.info(`Create ${res.id} Customer data success`);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async deleteCustomer(ctx, next) {
    const { personId } = ctx.params;

    const oPerson = await coreRepo.PersonRepository.findById(personId);
    if (!oPerson) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    oPerson.withCustomer(new CustomerObject()).bindBaseInfo(ctx.state.baseInfo);
    await coreRepo.PersonRepository.updateById(personId, oPerson);
    ctx.state.result = new models.CustomResult().withResult();
    await next();
  }
}

module.exports = CustomerController;
