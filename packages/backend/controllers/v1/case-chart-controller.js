/**
 * FeaturePath: 個案管理-基本資料-家屬資訊-v3家系圖、生態圖暫存、儲存、列表
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { models, codes, tools } = require('@erpv3/app-common');
const {
  CreateCaseChartRequest,
  UpdateCaseChartRequest,
} = require('@erpv3/app-core/application/contexts/req-objects');
const { CaseChartRepository } = require('@erpv3/app-core/infra/repositories');
const { CaseChartEntity, coreErrorCodes } = require('@erpv3/app-core/domain');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');

class CaseChartController {
  static async create(ctx, next) {
    const req = new CreateCaseChartRequest().bind(ctx.request.body).checkRequired();

    const payLoad = ctx.state.user || ctx.state.operator;

    const entity = new CaseChartEntity()
      .bind(req)
      .bindBaseInfo(ctx.state.baseInfo)
      .bindCreator(payLoad.personId);
    const res = await CaseChartRepository.save(entity);
    ctx.state.result = new models.CustomResult().withResult(res.toView());
    await next();
  }

  static async update(ctx, next) {
    const { caseChartId } = ctx.params;
    const { __vn } = ctx.state.baseInfo;
    const payLoad = ctx.state.user || ctx.state.operator;
    const req = new UpdateCaseChartRequest()
      .bind(ctx.request.body)
      .checkRequired();
    const entity = await CaseChartRepository.findOne(caseChartId);
    tools.CustomValidator.isEqual(entity.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    if (!entity) throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND);
    tools.CustomValidator.isEqual(entity.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);
    entity
      .bind(ctx.request.body)
      .bindModifier(payLoad.personId);
    if (req.chart) entity.bindChart(req.chart);
    if (req.relationChart) entity.bindRelationChart(req.relationChart);
    const res = await CaseChartRepository.save(entity);
    ctx.state.result = new models.CustomResult().withResult(res.toView());
    await next();
  }

  static async listByCaseId(ctx, next) {
    const { caseId } = ctx.request.query;
    const query = {};
    if (caseId) query.caseId = caseId;
    const res = await CaseChartRepository.listQbe(query);

    ctx.state.result = new models.CustomResult().withResult(res.map((r) => r.toView()));
    await next();
  }

  static async delete(ctx, next) {
    const payLoad = ctx.state.user || ctx.state.operator;
    const { caseChartId } = ctx.params;
    const entity = await CaseChartRepository.findOneReferByAnother(caseChartId);
    if (!entity) throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND);
    if (CustomValidator.nonEmptyArray(entity.refer)) throw new models.CustomError(coreErrorCodes.ERR_CASE_CHART_REFERRED_BY_ANOTHER);
    await CaseChartRepository.delete(caseChartId, payLoad.personId);

    ctx.state.result = new models.CustomResult().withResult();
    await next();
  }
}

module.exports = CaseChartController;
