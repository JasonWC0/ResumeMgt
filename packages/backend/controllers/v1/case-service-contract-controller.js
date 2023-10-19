/* eslint-disable no-case-declarations */
/* eslint-disable object-curly-newline */
/* eslint-disable newline-per-chained-call */
/**
 * FeaturePath: 經營管理-合約管理-個案合約-新讀刪修
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-service-contract-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-12-02 11:56:32 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const fsExtra = require('fs-extra');
const { codes, models } = require('@erpv3/app-common');
const conf = require('@erpv3/app-common/shared/config');
const { CustomValidator, customLogger, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { LunaServiceClass, LunaApi } = require('@erpv3/app-common/shared/connection-clients').LunaServiceClient;
const {
  CorporationRepository, CaseServiceContractRepository,
} = require('@erpv3/app-core/infra/repositories');
const {
  coreErrorCodes, companyServiceCodes, CaseServiceContractEntity, PersonEntity,
} = require('@erpv3/app-core/domain');
const { v25Map, getStringValue, getStringKey } = require('@erpv3/app-core/domain/enums/mapping');
const { ReadCaseServiceContractListRequest, CreateCaseServiceContractRequest, UpdateCaseServiceContractRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const CaseServiceContractListResponse = require('./res-objects/case-service-contract-list-response');

const clientDomain = {
  LUNA: 'LUNA',
  ERPV3: conf.SERVICE.NAME,
};

async function takeCorpSecret(corpId) {
  const corporationRes = await CorporationRepository.findById(corpId);
  if (!corporationRes) {
    customLogger.info(`Corporation ${corpId} not found`);
    throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND);
  }
  const keys = await fsExtra.readJson(corporationRes.__enc.provider);
  const secretKey = keys[corporationRes.__enc.keyId];
  return secretKey;
}

class CaseServiceContractController {
  /**
   * 讀取v2.5個案合約列表
   * @param {Object} req ReadCaseServiceContractListRequest
   * @returns {Object[], Number} data, total
   */
  static async _readV25List(cookie, req) {
    // STEP_01 Ask v2.5 case List
    /*
      [Request]companyId, service
      [Response][{caseId, name, service, relatedPeople}, {}]
    */
    const { HOST, KEY } = conf.LUNA;
    req.service = req.service.map((service) => getStringValue(v25Map.caseTypeMaps, service)).filter((s) => ![null, undefined].includes(s));
    const params = { companyId: req.companyId, service: req.service };
    const dataRes = await LunaServiceClass.normalAPI(HOST, KEY, cookie, params, LunaApi.ReadContractCaseList.key, false);
    if (!dataRes) { throw new models.CustomError(coreErrorCodes.ERR_LUNA_SERVICE_CALL_FAIL); }
    const { success, errors } = dataRes;
    if (!success) { throw new models.CustomError(`${errors.error.code}-${errors.error.message}`); }

    // STEP_02 Filter個案姓名
    let caseObj = [];
    if (CustomValidator.nonEmptyArray(dataRes.data)) {
      caseObj = CustomValidator.nonEmptyString(req.caseName) ? dataRes.data.filter((c) => new RegExp(req.caseName).test(c.name)) : dataRes.data;
      req.caseId = caseObj.map((c) => c.caseId);
    }

    // STEP_03.1 若無要查詢的個案Id，直接回傳無資料
    if (!CustomValidator.nonEmptyArray(req.caseId)) {
      return { data: [], total: 0 };
    }

    // STEP_03.2 Query個案合約
    const caseServiceContractRes = await CaseServiceContractRepository.findByQBE(req);

    // STEP_04 組合個案資料(STEP_02)+合約資料(STEP_03)
    caseObj.forEach((c) => {
      c.service = getStringKey(v25Map.caseTypeMaps, c.service);
      const { caseId, name, service, relatedPeople } = c;
      const contractRes = caseServiceContractRes.find((con) => con.id === caseId);
      c.id = caseId;
      c.personInfo = { name };
      c.hc = CustomValidator.isEqual(service, companyServiceCodes.HC);
      c.dc = CustomValidator.isEqual(service, companyServiceCodes.DC);
      c.contracts = contractRes?.contracts || [];
      c.contractCount = {
        HC: contractRes?.contractCount?.HC || 0,
        DC: contractRes?.contractCount?.DC || 0,
        RC: contractRes?.contractCount?.RC || 0,
      };
      c.principalList = relatedPeople;
    });

    // STEP_05.1 先檢查是否有Filter startDate, endDate, principal => 過濾資料
    let resList = CustomUtils.deepCopy(caseObj);
    if (req.queryStartDate || req.queryEndDate || CustomValidator.nonEmptyString(req.principal)) {
      resList = resList.filter((c) => c.contractCount.HC !== 0 || c.contractCount.DC !== 0);
    }
    // STEP_05.2 Filter 是否有合約
    if (CustomValidator.isBoolean(req.hasHCContract) || CustomValidator.isBoolean(req.hasDCContract) || CustomValidator.isBoolean(req.hasRCContract)) {
      if (CustomValidator.isBoolean(req.hasHCContract)) {
        resList = req.hasHCContract ? resList.filter((c) => c.contractCount.HC !== 0) : resList.filter((c) => c.contractCount.HC === 0);
      }
      if (CustomValidator.isBoolean(req.hasDCContract)) {
        resList = req.hasDCContract ? resList.filter((c) => c.contractCount.DC !== 0) : resList.filter((c) => c.contractCount.DC === 0);
      }
    }
    const data = resList.slice(req.skip, req.skip + req.limit);
    const total = resList.length;

    return { data, total };
  }

  /**
   * 讀取v3個案合約列表
   * @param {Object} ctx context
   * @param {Object} req ReadCaseServiceContractListRequest
   * @return {Object[], Number} data, total
   */
  static async _readV3List(corpId, req) {
    const secretKey = await takeCorpSecret(corpId);

    // Query 個案合約列表
    const caseServiceContractRes = await CaseServiceContractRepository.findByCaseBaseQBE(req);
    const caseServiceContractCount = await CaseServiceContractRepository.countByCaseBaseQBE(req);

    // 取得姓名
    if (CustomValidator.nonEmptyArray(caseServiceContractRes)) {
      for await (const c of caseServiceContractRes) {
        const personObj = new PersonEntity().bind(c.personInfo);
        await personObj.withKey(secretKey.key).withIv(secretKey.iv).decryption();
        c.personInfo = personObj;
      }
    }

    return { data: caseServiceContractRes, total: caseServiceContractCount };
  }

  /**
   * 讀取個案合約列表
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async readList(ctx, next) {
    const { companyId } = ctx.state.operator;
    const { name } = ctx.state.basicClient;
    const mReq = new ReadCaseServiceContractListRequest().bind(ctx.request.query).bindCompanyId(companyId).checkRequired();

    let _response;
    switch (name) {
      case clientDomain.LUNA:
        const { cookie } = ctx.request.headers;
        _response = await CaseServiceContractController._readV25List(cookie, mReq);
        break;
      case clientDomain.ERPV3:
        const { corpId } = ctx.state.user;
        _response = await CaseServiceContractController._readV3List(corpId, mReq);
        break;
      default:
        break;
    }

    const response = new CaseServiceContractListResponse();
    response.data = _response?.data || [];
    response.total = _response?.total || 0;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  /**
   * 讀取個案合約
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async read(ctx, next) {
    const { caseServiceContractId } = ctx.params;

    // check the id exist
    const caseServiceContractRes = await CaseServiceContractRepository.findById(caseServiceContractId);
    if (!caseServiceContractRes) {
      throw new models.CustomError(coreErrorCodes.ERR_CASE_CONTRACT_NOT_EXIST);
    }

    ctx.state.result = new models.CustomResult().withResult(caseServiceContractRes.toView());
    await next();
  }

  /**
   * 建立個案合約
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async create(ctx, next) {
    const { personId } = ctx.state.operator;
    const { __cc, __sc } = ctx.state.baseInfo;
    const { basicClient } = ctx.state;
    const mReq = new CreateCaseServiceContractRequest().bind(ctx.request.body).checkRequired();
    const entity = new CaseServiceContractEntity().bind(mReq).bindBaseInfo({ __cc, __sc }).bindCreator(personId).bindModifier(personId).bindClientDomain(basicClient.name);
    if (entity.file) { entity.file.updateTime(); }
    await CaseServiceContractRepository.create(entity);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  /**
   * 更新個案合約
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async update(ctx, next) {
    const { caseServiceContractId } = ctx.params;
    const { personId } = ctx.state.operator;
    const { __cc, __sc, __vn } = ctx.state.baseInfo;
    const mReq = new UpdateCaseServiceContractRequest().bind(ctx.request.body).checkRequired();

    // check the id exist
    const caseServiceContractRes = await CaseServiceContractRepository.findById(caseServiceContractId);
    if (!caseServiceContractRes) {
      throw new models.CustomError(coreErrorCodes.ERR_CASE_CONTRACT_NOT_EXIST);
    }
    // check the __vn is equal
    CustomValidator.isEqual(caseServiceContractRes.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    // update file updatedAt
    const oriFile = caseServiceContractRes.file ? { id: caseServiceContractRes.file.id, fileName: caseServiceContractRes.file.fileName, publicUrl: caseServiceContractRes.file.publicUrl } : null;
    const newFile = mReq.file ? { id: mReq.file.id, fileName: mReq.file.fileName, publicUrl: mReq.file.publicUrl } : null;
    const theSameFile = CustomValidator.isEqual(oriFile, newFile);
    if (mReq.file && !theSameFile) {
      mReq.file.updateTime();
    } else if (oriFile && theSameFile) {
      // 避免遺漏原始資料 updatedAt
      mReq.file.bind(caseServiceContractRes.file);
    }

    const entity = new CaseServiceContractEntity().bind(mReq).bindBaseInfo({ __cc, __sc }).bindModifier(personId);
    await CaseServiceContractRepository.updateById(caseServiceContractId, entity);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  /**
   * 刪除個案合約
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async delete(ctx, next) {
    const { caseServiceContractId } = ctx.params;
    const { personId } = ctx.state.operator;
    const { __cc, __sc } = ctx.state.baseInfo;
    await CaseServiceContractRepository.deleteById(caseServiceContractId, { __cc, __sc }, personId);
    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = CaseServiceContractController;
