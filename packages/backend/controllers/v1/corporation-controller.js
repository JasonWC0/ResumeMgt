/* eslint-disable no-case-declarations */
/**
 * FeaturePath: 經營管理-系統管理-機構服務設定-新增集團總公司基本資料
 * FeaturePath: 經營管理-系統管理-機構服務設定-編輯集團總公司基本資料
 * FeaturePath: 經營管理-系統管理-機構服務設定-檢視集團總公司基本資料
 * FeaturePath: 經營管理-系統管理-機構服務設定-刪除集團總公司基本資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: Corporation-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-02-17 11:53:01 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models, tools, codes } = require('@erpv3/app-common');
const { CreateCorporationRequest, UpdateCorporationRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { CorporationRepository } = require('@erpv3/app-core/infra/repositories');
const CorporationEntity = require('@erpv3/app-core/domain/entity/corporation-entity');
const coreErrorCodes = require('@erpv3/app-core/domain/enums/error-codes');

class CorporationController {
  static async create(ctx, next) {
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new CreateCorporationRequest()
      .bind(ctx.request.body)
      .checkRequired();

    let oCorp;
    oCorp = await CorporationRepository.findByShortname(mReq.shortName);
    if (oCorp) { throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NAME_DUPLICATE); }

    oCorp = await CorporationRepository.findByCode(mReq.code);
    if (oCorp) { throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_CODE_DUPLICATE); }

    tools.customLogger.info(`Create new corporation ${mReq.fullName}`);
    oCorp = new CorporationEntity().bind(mReq).bindBaseInfo({ __cc, __sc });

    oCorp = await CorporationRepository.create(oCorp);

    ctx.state.result = new models.CustomResult().withResult({ corpId: oCorp.id });
    await next();
  }

  static async read(ctx, next) {
    const { corpId } = ctx.params;
    tools.customLogger.info(`Find one corporation by ${corpId}`);
    const oCorp = await CorporationRepository.findById(corpId);
    if (!oCorp) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    ctx.state.result = new models.CustomResult().withResult(oCorp.toView());
    await next();
  }

  static async delete(ctx, next) {
    const { corpId } = ctx.params;

    tools.customLogger.info(`Delete ${corpId} corporation`);
    const oCorp = await CorporationRepository.findById(corpId);
    if (!oCorp || !oCorp.valid) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    oCorp.bindBaseInfo(ctx.state.baseInfo);
    oCorp.valid = false;
    await CorporationRepository.update(oCorp);
    ctx.state.result = new models.CustomResult().withResult();
    await next();
  }

  static async update(ctx, next) {
    const { corpId } = ctx.params;
    const { __vn } = ctx.state.baseInfo;
    const corpRes = await CorporationRepository.findById(corpId);
    if (!corpRes) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    const mReq = new UpdateCorporationRequest()
      .bind(corpRes)
      .bind(ctx.request.body)
      .bindBaseInfo(ctx.state.baseInfo)
      .checkRequired();

    tools.CustomValidator.isEqual(corpRes.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);
    corpRes.bind(mReq.dataObj).bindBaseInfo(ctx.state.baseInfo);

    await CorporationRepository.update(corpRes);
    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = CorporationController;
