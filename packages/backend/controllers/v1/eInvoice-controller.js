/* eslint-disable object-curly-newline */
/* eslint-disable newline-per-chained-call */
/**
 * FeaturePath: 經營管理-財會-個案帳務管理-電子發票
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: eInvoice-controller.js
 * Project: @erpv3/backend
 * File Created: 2023-03-07 03:06:45 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const fsExtra = require('fs-extra');
const conf = require('@erpv3/app-common/shared/config');
const { models, LOGGER } = require('@erpv3/app-common');
const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { ECPayServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const { ECPayService } = require('@erpv3/app-core/application/service');
const { ReadEInvoiceListRequest, CreateEInvoiceRequest, UpdateEInvoiceRequest, ExportSyncEInvoiceRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { coreErrorCodes, eInvoiceCodes, PersonEntity, EInvoiceEntity } = require('@erpv3/app-core/domain');
const { EInvoiceRepository, CompanyRepository, CorporationRepository } = require('@erpv3/app-core/infra/repositories');
const EInvoiceListResponse = require('./res-objects/eInvoice-list-response');

const { HOST } = conf.EINVOICE.ECPAY;
const { ECPayServiceClass, ECPAY_API } = ECPayServiceClient;
const { eInvoiceStatusCodes } = eInvoiceCodes;
const eInvoiceService = {
  ecPay: 'ecPay',
};

async function _takeCorpSecretKey(corpId) {
  const corpEntity = await CorporationRepository.findById(corpId);
  if (!corpEntity) {
    LOGGER.info(`Corporation ${corpId} not found`);
    throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND);
  }
  const keys = await fsExtra.readJson(corpEntity.__enc.provider);
  return keys[corpEntity.__enc.keyId];
}

async function _takeCompanyEInvoiceSetting(companyId, service = eInvoiceService.ecPay) {
  const companyRes = await CompanyRepository.findById(companyId);
  if (!companyRes.eInvoiceSetting || !companyRes.eInvoiceSetting[service]) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_DOES_NOT_SUPPORT_EINVOICE); }
  if (CustomValidator.isEqual(service, eInvoiceService.ecPay)) {
    const { merchantId, hashKey, hashIV } = companyRes.eInvoiceSetting[service];
    if (!CustomValidator.nonEmptyString(merchantId) || !CustomValidator.nonEmptyString(hashKey) || !CustomValidator.nonEmptyString(hashIV)) {
      throw new models.CustomError(coreErrorCodes.ERR_COMPANY_DOES_NOT_SUPPORT_EINVOICE);
    }
  }

  return companyRes.eInvoiceSetting[service];
}

class EInvoiceController {
  static async createEInvoice(ctx, next) {
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new CreateEInvoiceRequest().bind(ctx.request.body).baseCheckRequired().checkRequired();

    // 結帳編號已有發票(開立or未開立)
    const exist = await EInvoiceRepository.findOne({ serialString: mReq.serialString, status: { $in: [eInvoiceStatusCodes.issue, eInvoiceStatusCodes.unIssued] } });
    if (exist) { throw new models.CustomError(coreErrorCodes.ERR_EINVOICE_SERIAL_STRING_IS_EXIST); }

    const entity = new EInvoiceEntity().bind(mReq).bindBaseInfo({ __cc, __sc }).bindCreator(personId).bindModifier(personId).withSpecialTaxType();
    const res = await EInvoiceRepository.create(entity);
    if (!res) { throw new models.CustomError(coreErrorCodes.ERR_FIELD_OBJECT_ID_WRONG_FORMAT); }

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async updateEInvoice(ctx, next) {
    const { eInvoiceId } = ctx.params;
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new UpdateEInvoiceRequest().bind(ctx.request.body).baseCheckRequired().checkRequired();

    // 已開立不可編輯
    const issued = await EInvoiceRepository.findOne({ _id: eInvoiceId, status: eInvoiceStatusCodes.issue });
    if (issued) { throw new models.CustomError(coreErrorCodes.ERR_EINVOICE_IS_ISSUED); }

    const entity = new EInvoiceEntity().bind(mReq).bindBaseInfo({ __cc, __sc }).bindModifier(personId).withSpecialTaxType();
    const res = await EInvoiceRepository.updateById(eInvoiceId, entity);
    if (!res) { throw new models.CustomError(coreErrorCodes.ERR_EINVOICE_NOT_EXIST); }

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async readEInvoiceList(ctx, next) {
    const { companyId } = ctx.state.baseInfo;
    ctx.request.query.companyId = companyId;
    const mReq = new ReadEInvoiceListRequest().bind(ctx.request.query).checkRequired().setQDateType();

    // STEP_1 query DB
    const eInvoiceRes = await EInvoiceRepository.findByQBE(mReq);
    const count = await EInvoiceRepository.countByQBE(mReq);

    // STEP_2 decryption加密資料(姓名)
    const companyRes = await CompanyRepository.findById(companyId);
    if (CustomValidator.nonEmptyArray(eInvoiceRes)) {
      const secretKey = await _takeCorpSecretKey(companyRes.corpId);
      for await (const eInvoice of eInvoiceRes) {
        const personEntity = new PersonEntity().bind(eInvoice.personInfo);
        await personEntity.withKey(secretKey.key).withIv(secretKey.iv).decryption();
        eInvoice.caseName = personEntity.name;
      }
    }

    // STEP_3 response
    const response = new EInvoiceListResponse();
    response.data = eInvoiceRes;
    response.total = count;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async issue(ctx, next) {
    const { eInvoiceId } = ctx.params;
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;

    // STEP_1 take DB Data
    const eInvoiceRes = await EInvoiceRepository.findOne({ _id: eInvoiceId });
    if (!eInvoiceRes) { throw new models.CustomError(coreErrorCodes.ERR_EINVOICE_NOT_EXIST); }

    // STEP_2 take company eInvoice Setting (default: ecPay)
    const { merchantId, hashKey, hashIV } = await _takeCompanyEInvoiceSetting(eInvoiceRes.companyId);

    // STEP_3 structure request ECPay data
    const data = ECPayService.structReqIssue(eInvoiceRes);

    // STEP_4 call ECPay API
    const ecRes = await ECPayServiceClass.callAPI(HOST, ECPAY_API.Issue, { hashKey, hashIV }, merchantId, data);
    const { InvoiceNo, InvoiceDate } = ecRes;
    if (!CustomValidator.nonEmptyString(InvoiceNo)) { throw new models.CustomError(coreErrorCodes.ERR_EINVOICE_SYSTEM_ISSUED_FAIL); }

    // STEP_5 write data to DB: 發票號碼, 開立時間
    const invoicedData = { invoiceNumber: InvoiceNo, issuedDate: ECPayService.transferResDate(InvoiceDate), __cc, __sc, modifier: personId };
    await EInvoiceRepository.updateOne(eInvoiceId, invoicedData);

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async export(ctx, next) {
    const { companyId } = ctx.state.baseInfo;
    const mReq = new ExportSyncEInvoiceRequest().bind(ctx.request.body).checkRequired().transferToDate();

    // STEP_1 query DB
    const eInvoiceRes = await EInvoiceRepository.findByQBE(mReq);

    // STEP_2 decryption加密資料(姓名)
    const companyRes = await CompanyRepository.findById(companyId);
    if (CustomValidator.nonEmptyArray(eInvoiceRes)) {
      const secretKey = await _takeCorpSecretKey(companyRes.corpId);
      for await (const eInvoice of eInvoiceRes) {
        const personEntity = new PersonEntity().bind(eInvoice.personInfo);
        await personEntity.withKey(secretKey.key).withIv(secretKey.iv).decryption();
        eInvoice.caseName = personEntity.name;
      }
    }

    // TODO: generate csv
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async sync(ctx, next) {
    const { personId } = ctx.state.user;
    const { __cc, __sc, companyId } = ctx.state.baseInfo;
    const mReq = new ExportSyncEInvoiceRequest().bind(ctx.request.body).checkRequired().transferToDate();

    // STEP_1 take company eInvoice Setting (default: ecPay)
    const { merchantId, hashKey, hashIV } = await _takeCompanyEInvoiceSetting(companyId);

    // STEP_2 1st call ECPay API
    const invoiceList = await ECPayService.getSyncList(merchantId, mReq.sDate, mReq.eDate, hashKey, hashIV);

    // STEP_3 mapping and update invoices data
    const objArray = invoiceList.map((ecInvoice) => {
      const obj = ECPayService.transferResSyncEInvoice(ecInvoice);
      const setData = CustomUtils.deepCopy(obj);
      delete setData.id;
      const opInfo = { __cc, __sc, modifier: personId };
      Object.assign(setData, opInfo);

      return {
        id: obj.id,
        setData,
      };
    });
    await EInvoiceRepository.updateMulti(objArray);

    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = EInvoiceController;
