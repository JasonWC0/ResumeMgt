/**
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設功能(新增服務)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設功能(編輯服務)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設功能(檢視服務)
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: service-group-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-04-01 03:12:22 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models, codes, tools } = require('@erpv3/app-common');
const { CreateServiceGroupRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { coreErrorCodes, ServiceGroupEntity } = require('@erpv3/app-core/domain');
const { ServiceGroupRepository } = require('@erpv3/app-core/infra/repositories');
const ServiceGroupListResponse = require('./res-objects/service-group-list-response');

class ServiceGroupController {
  static async readList(ctx, next) {
    const res = await ServiceGroupRepository.findAll();

    const response = new ServiceGroupListResponse();
    response.list = res;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async read(ctx, next) {
    const { serviceGroupId } = ctx.params;

    const res = await ServiceGroupRepository.findById(serviceGroupId);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    ctx.state.result = new models.CustomResult().withResult(res.toView());
    await next();
  }

  static async update(ctx, next) {
    const { serviceGroupId } = ctx.params;
    const { pageAuth, reportAuth } = ctx.request.body;
    const { __vn } = ctx.state.baseInfo;

    const res = await ServiceGroupRepository.findById(serviceGroupId);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    tools.CustomValidator.isEqual(res.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    res.withPageAuth(pageAuth).withReportAuth(reportAuth).bindBaseInfo(ctx.state.baseInfo);
    await ServiceGroupRepository.updateById(serviceGroupId, res);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async create(ctx, next) {
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new CreateServiceGroupRequest().bind(ctx.request.body).checkRequired();

    const serviceGroupRes = await ServiceGroupRepository.findByCode(mReq.code);
    if (serviceGroupRes) { throw new models.CustomError(coreErrorCodes.ERR_SERVICE_GROUP_CODE_EXIST); }

    const entity = new ServiceGroupEntity().bind(mReq).bindBaseInfo({ __cc, __sc });
    const res = await ServiceGroupRepository.create(entity);
    ctx.state.result = new models.CustomResult().withResult({ id: res ? res.id : '' });
    await next();
  }
}

module.exports = ServiceGroupController;
