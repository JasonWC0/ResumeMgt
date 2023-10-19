/**
 * FeaturePath: 經營管理-評鑑管理-逐案分析-編輯公司日照評鑑表單範本列表
 * FeaturePath: 經營管理-評鑑管理-逐案分析-檢視公司日照評鑑表單範本列表
 * FeaturePath: 個案管理-評估-評估管理-編輯公司評估表單範本列表
 * FeaturePath: 個案管理-評估-評估管理-檢視公司評估表單範本列表
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-03-08 10:35:36 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models, codes, tools } = require('@erpv3/app-common');
const { UpdateFormRequest, ReadCompanyFormListRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { FormRepository } = require('@erpv3/app-core/infra/repositories');
const CompanyFormListResponse = require('./res-objects/company-form-list-response');

class FormController {
  static async readList(ctx, next) {
    const qbe = new ReadCompanyFormListRequest().bind(ctx.request.query).checkRequired();

    if (!qbe.history) { qbe.inUse = true; }
    const formRes = await FormRepository.findByCompany(qbe.companyId, qbe);
    const resData = new CompanyFormListResponse();
    resData.list = formRes;
    ctx.state.result = new models.CustomResult().withResult(resData.toView());
    await next();
  }

  static async read(ctx, next) {
    const { formId } = ctx.params;

    const formRes = await FormRepository.findById(formId);
    if (!formRes) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    ctx.state.result = new models.CustomResult().withResult(formRes.toView());
    await next();
  }

  static async update(ctx, next) {
    const { formId } = ctx.params;
    const { __vn } = ctx.state.baseInfo;

    const formRes = await FormRepository.findById(formId);
    if (!formRes) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    tools.CustomValidator.isEqual(formRes.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    const mReq = new UpdateFormRequest().bind(ctx.request.body).checkRequired();
    formRes.bind(mReq).bindBaseInfo(ctx.state.baseInfo);
    await FormRepository.updateById(formId, formRes);
    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = FormController;
