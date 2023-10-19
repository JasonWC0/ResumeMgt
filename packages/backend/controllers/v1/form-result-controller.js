/**
 * FeaturePath: 經營管理-評鑑管理-逐案分析-新增日照評鑑表單
 * FeaturePath: 經營管理-評鑑管理-逐案分析-檢視日照評鑑表單
 * FeaturePath: 經營管理-評鑑管理-逐案分析-編輯日照評鑑表單
 * FeaturePath: 經營管理-評鑑管理-逐案分析-刪除日照評鑑表單
 * FeaturePath: 個案管理-評估-評估管理-新增評估表單
 * FeaturePath: 個案管理-評估-評估管理-編輯評估表單
 * FeaturePath: 個案管理-評估-評估管理-檢視評估表單
 * FeaturePath: 個案管理-評估-評估管理-刪除評估表單
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-result-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-03-15 01:36:35 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const {
  models, codes, LOGGER, tools,
} = require('@erpv3/app-common');
const { CustomValidator, CustomUtils } = require('@erpv3/app-common').tools;
const { FormReviewService } = require('@erpv3/app-core/application/service');
const {
  ReadFormResultListRequest, CreateFormResultRequest, UpdateFormResultRequest, DeleteFormResultListRequest,
} = require('@erpv3/app-core/application/contexts/req-objects');
const { FormRepository, FormResultRepository } = require('@erpv3/app-core/infra/repositories');
const {
  FormResultEntity, FormReviewStatusEntity, FormReviewHistoryEntity, coreErrorCodes,
} = require('@erpv3/app-core/domain');
const FormResultListResponse = require('./res-objects/form-result-list-response');
const NewestFormResultGroupByCaseListResponse = require('./res-objects/form-result-case-newest-list-response');

const extendData = {
  form: 'form',
  status: 'status',
};

class FormResultController {
  static async _checkFormResult(operatorCompanyId, category, formResultId) {
    LOGGER.info(`Find formResultId => ${formResultId}`);
    const formResultRes = await FormResultRepository.findById(formResultId);
    if (!formResultRes) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    CustomValidator.isEqual(operatorCompanyId, formResultRes.companyIdStr, coreErrorCodes.ERR_USER_COMPANY_ID_IS_DIFF);
    CustomValidator.isEqual(category, formResultRes.category, coreErrorCodes.ERR_FORM_RESULT_CATEGORY_IS_DIFF);
    return formResultRes;
  }

  static async _takeOneFormAndStatus(formResult) {
    const formRes = await FormRepository.findById(formResult.formId);
    const formStatusRes = (await FormReviewService.readListByCompoundIdx([formResult.id], formResult.category, formResult.type))[0];
    return { formRes, formStatusRes };
  }

  static async readList(ctx, next) {
    const { category } = ctx.params;
    const { companyId } = ctx.state.operator;

    ctx.request.query.c = category;
    const mReq = new ReadFormResultListRequest()
      .bind(ctx.request.query).checkRequired().setOrder();

    if (!tools.CustomValidator.nonEmptyString(mReq.caseId)) {
      mReq.companyId = companyId;
    }

    // get form results
    const formResultRes = await FormResultRepository.findByQBE(mReq);
    const count = await FormResultRepository.countByQBE(mReq);
    // get forms review status
    const fids = formResultRes.map((value) => value.id);
    const formStatusRes = await FormReviewService.readListByCompoundIdx(fids, mReq.c, mReq.t);

    const response = new FormResultListResponse();
    response.total = count;
    response.data = formResultRes;
    response.formReviewStatus = formStatusRes;
    response.detail = mReq.detail;
    response.pick = mReq.pick;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async read(ctx, next) {
    const { category, formResultId } = ctx.params;
    const { companyId } = ctx.state.operator;

    LOGGER.info(`Find formResultId => ${formResultId}`);
    const formResultRes = await FormResultRepository.findById(formResultId);
    if (!formResultRes) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    CustomValidator.isEqual(companyId, formResultRes.companyIdStr, coreErrorCodes.ERR_USER_COMPANY_ID_IS_DIFF);
    CustomValidator.isEqual(category, formResultRes.category, coreErrorCodes.ERR_FORM_RESULT_CATEGORY_IS_DIFF);

    const extendMap = {
      [extendData.form]: {},
      [extendData.status]: {},
    };

    await Promise.all(
      Object.keys(extendMap).map(async (key) => {
        let value = {};
        switch (key) {
          case extendData.form:
            value = await FormRepository.findById(formResultRes.formId);
            break;
          case extendData.status:
            // eslint-disable-next-line prefer-destructuring
            value = (await FormReviewService.readListByCompoundIdx([formResultRes.id], formResultRes.category, formResultRes.type))[0];
            break;
          default:
            break;
        }
        extendMap[key] = value;
      })
    );

    ctx.state.result = new models.CustomResult().withResult(formResultRes.toView(extendMap[extendData.form], extendMap[extendData.status]));
    await next();
  }

  static async readNewestGroupByCase(ctx, next) {
    const { companyId } = ctx.state.operator;
    const { t } = ctx.request.query;

    // STEP_1 check required
    new CustomValidator().nonEmptyStringThrows(t, coreErrorCodes.ERR_FORM_TYPE_IS_EMPTY);
    const type = t.split(',');

    // STEP_2 query
    const resList = await FormResultRepository.findCaseNewest(companyId, type);

    // STEP_3 response
    const response = new NewestFormResultGroupByCaseListResponse();
    response.list = resList;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async create(ctx, next) {
    const { category } = ctx.params;
    const { companyId, personId, name } = ctx.state.operator;
    const { basicClient } = ctx.state;
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new CreateFormResultRequest().bind(ctx.request.body).checkRequired();

    // check from exist
    LOGGER.info(`Find formId => ${mReq.formId}`);
    const formRes = await FormRepository.findById(mReq.formId);
    if (!formRes) { throw new models.CustomError(coreErrorCodes.ERR_FORM_ID_NOT_EXIST); }
    CustomValidator.isEqual(companyId, formRes.companyIdStr, coreErrorCodes.ERR_USER_COMPANY_ID_IS_DIFF);
    CustomValidator.isEqual(category, formRes.category, coreErrorCodes.ERR_FORM_RESULT_CATEGORY_IS_DIFF);

    // set default data
    const submittedAt = new Date();
    const entity = new FormResultEntity()
      .bind(mReq)
      .bindBaseInfo({ __cc, __sc })
      .bindDefault(basicClient.name, formRes, personId, submittedAt);

    // create form result
    const res = await FormResultRepository.createOne(entity);

    // create review status and history
    const statusEntity = new FormReviewStatusEntity()
      .bindForm(formRes, res, name)
      .bindBaseInfo({ __cc, __sc });
    const historyEntity = new FormReviewHistoryEntity()
      .bind(statusEntity)
      .bindSubmitter({ personId, name })
      .bindBaseInfo({ __cc, __sc });
    await FormReviewService.initSubmit(formRes.reviewType, statusEntity, historyEntity);

    ctx.state.result = new models.CustomResult().withResult(res);
    await next();
  }

  static async update(ctx, next) {
    const { category, formResultId } = ctx.params;
    const { personId, name, companyId } = ctx.state.operator;
    const { __vn, __cc, __sc } = ctx.state.baseInfo;
    const mReq = new UpdateFormResultRequest().bind(ctx.request.body).checkRequired();

    // check form result exist and data correct
    const formResultRes = await FormResultController._checkFormResult(companyId, category, formResultId);

    CustomValidator.isEqual(formResultRes.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    // check status
    const { formRes, formStatusRes } = await FormResultController._takeOneFormAndStatus(formResultRes);
    const canModify = await FormReviewService.checkStatusForUpdateStatusRes(formStatusRes, 'update');
    if (!canModify) { throw new models.CustomError(coreErrorCodes.ERR_REVIEW_STATUS_LOCKED); }

    // update form result
    const entity = formResultRes.updateBind(mReq).bindBaseInfo(ctx.state.baseInfo);
    entity.modifier = personId;
    await FormResultRepository.updateById(formResultId, entity);

    // update review status and history
    const newStatusEntity = CustomUtils.deepCopy(formStatusRes);
    newStatusEntity.fillerName = entity.filler.name;
    newStatusEntity.reviewRoles = formRes.reviewRoles;
    newStatusEntity.bindBaseInfo(ctx.state.baseInfo);
    const historyEntity = new FormReviewHistoryEntity()
      .bind(newStatusEntity)
      .bindSubmitter({ personId, name })
      .bindBaseInfo({ __cc, __sc });
    historyEntity.submittedAt = new Date();
    await FormReviewService.update(formRes.reviewType, formStatusRes, newStatusEntity, historyEntity);

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async delete(ctx, next) {
    const { category, formResultId } = ctx.params;
    const { companyId, personId } = ctx.state.operator;

    // check form result exist and data correct
    const formResultRes = await FormResultController._checkFormResult(companyId, category, formResultId);

    // check status
    const { formStatusRes } = await FormResultController._takeOneFormAndStatus(formResultRes);
    const canModify = await FormReviewService.checkStatusForUpdateStatusRes(formStatusRes, 'update');
    if (!canModify) { throw new models.CustomError(coreErrorCodes.ERR_REVIEW_STATUS_LOCKED); }

    // delete
    await FormResultRepository.deleteById(formResultId, ctx.state.baseInfo, personId);
    await FormReviewService.delete(formStatusRes.id, ctx.state.baseInfo, personId);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async deleteList(ctx, next) {
    const { category } = ctx.params;
    const { companyId, personId } = ctx.state.operator;
    const mReq = new DeleteFormResultListRequest().bind(ctx.request.body).checkRequired();

    const { ids } = mReq;
    const failList = [];
    const successList = [];
    await Promise.all(ids.map(async (id) => {
      const formResultRes = await FormResultRepository.findById(id);
      if (!formResultRes) { failList.push(id); return; }
      if (!CustomValidator.isEqual(companyId, formResultRes.companyIdStr)) { failList.push(id); return; }
      if (!CustomValidator.isEqual(category, formResultRes.category)) { failList.push(id); return; }

      const { formStatusRes } = await FormResultController._takeOneFormAndStatus(formResultRes);
      const canModify = await FormReviewService.checkStatusForUpdateStatusRes(formStatusRes, 'update');
      if (!canModify) { failList.push(id); return; }

      await FormResultRepository.deleteById(id, ctx.state.baseInfo, personId);
      await FormReviewService.delete(formStatusRes.id, ctx.state.baseInfo, personId);
      successList.push(id);
    }));

    ctx.state.result = new models.CustomResult().withResult({ successList, failList });
    next();
  }
}

module.exports = FormResultController;
