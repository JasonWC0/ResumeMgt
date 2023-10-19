/**
 * FeaturePath: 仁寶平台管理-營運管理-機構參數設定-新增個案收據設定
 * FeaturePath: 仁寶平台管理-營運管理-機構參數設定-編輯個案收據設定
 * FeaturePath: 仁寶平台管理-營運管理-機構參數設定-條列個案收據設定
 * FeaturePath: 仁寶平台管理-營運管理-機構參數設定-刪除個案收據設定
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { codes, models, LOGGER } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { ReceiptSettingRepository, CompanyRepository } = require('@erpv3/app-core/infra/repositories');
const reqobjs = require('@erpv3/app-core/application/contexts/req-objects');
const ReceiptSettingEntity = require('@erpv3/app-core/domain/entity/receipt-setting-entity');
const coreErrorCodes = require('@erpv3/app-core/domain/enums/error-codes');

/**
 * @class
 * @classdesc Storage Service Api Controller
 */
class ReceiptSettingController {
  static async createReceiptSetting(ctx, next) {
    const { __cc, __sc } = ctx.state.baseInfo;

    const mReq = new reqobjs.CreateReceiptSettingRequest()
      .bind(ctx.request.body)
      .checkRequired();

    const oCompany = await CompanyRepository.findById(mReq.companyId);
    if (!oCompany) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND); }

    const _receiptSetting = new ReceiptSettingEntity()
      .bind(mReq)
      .bindBaseInfo({ __cc, __sc })
      .bindCreator((ctx.state.user && ctx.state.user.personId) || null);

    LOGGER.info(`Create case receipt setting ${mReq.pos} in company ${mReq.companyId}`);
    await ReceiptSettingRepository.create(_receiptSetting);
    ctx.state.result = new models.CustomResult().withResult();
    await next();
  }

  static async listReceiptSetting(ctx, next) {
    const req = new reqobjs.ReadReceiptSettingListRequest()
      .bind(ctx.request.query)
      .checkRequired();
    const oCompany = await CompanyRepository.findById(req.companyId);
    if (!oCompany) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND); }

    LOGGER.info(`List service items by company ${req.companyId} and type ${req.reportType}`);
    const qbe = (CustomValidator.nonEmptyString(req.reportType)) ? { reportType: req.reportType } : {};
    let oReceiptSettings = await ReceiptSettingRepository.listByCompanyId(req.companyId, qbe);
    oReceiptSettings = oReceiptSettings.map((si) => si.toView());
    ctx.state.result = new models.CustomResult().withResult(oReceiptSettings);
    await next();
  }

  static async deleteReceiptSetting(ctx, next) {
    const { receiptSettingId } = ctx.params;
    const { __cc, __sc } = ctx.state.baseInfo;

    LOGGER.info(`Delete ${receiptSettingId} receipt setting item`);
    const oReceiptSetting = await ReceiptSettingRepository.findOne(receiptSettingId);
    if (!oReceiptSetting) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    oReceiptSetting.bindModifier((ctx.state.user && ctx.state.user.personId) || null);
    await ReceiptSettingRepository.deleteReceiptSetting(oReceiptSetting, { __cc, __sc });
    ctx.state.result = new models.CustomResult().withResult();
    await next();
  }

  static async updateReceiptSetting(ctx, next) {
    const { receiptSettingId } = ctx.params;
    const { __vn } = ctx.state.baseInfo;

    LOGGER.info(`Find ${receiptSettingId} receipt setting`);
    const oReceiptSetting = await ReceiptSettingRepository.findOne(receiptSettingId);
    if (!oReceiptSetting) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    CustomValidator.isEqual(oReceiptSetting.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    const mReq = new reqobjs.UpdateReceiptSettingRequest()
      .bind(ctx.request.body)
      .checkRequired();
    LOGGER.info(`Update ${receiptSettingId} receipt setting, field ${JSON.stringify(mReq)}`);
    oReceiptSetting.bind(mReq).bindModifier((ctx.state.user && ctx.state.user.personId) || null);
    await ReceiptSettingRepository.updateOne(oReceiptSetting);
    ctx.state.result = new models.CustomResult().withResult();
    await next();
  }
}

module.exports = ReceiptSettingController;
