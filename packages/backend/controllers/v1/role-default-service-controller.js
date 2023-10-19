/**
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設角色(新增員工角色)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設角色(編輯員工角色)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設角色(檢視員工角色)
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: role-default-service-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-04-12 10:10:53 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models, codes, tools } = require('@erpv3/app-common');
const { CreateRoleDefaultServiceRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { RoleDefaultServiceRepository, ServiceGroupRepository } = require('@erpv3/app-core/infra/repositories');
const {
  RoleDefaultServiceEntity, coreErrorCodes, employeeRoleCodes, manageAuthLevelCodes,
} = require('@erpv3/app-core/domain');
const RoleDefaultServiceListResponse = require('./res-objects/role-default-service-list-response');

class ServiceGroupController {
  static async readList(ctx, next) {
    const res = await RoleDefaultServiceRepository.findAll();

    const response = new RoleDefaultServiceListResponse();
    response.list = res;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }

  static async read(ctx, next) {
    const { roleDefaultServiceId } = ctx.params;

    const res = await RoleDefaultServiceRepository.findById(roleDefaultServiceId);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    ctx.state.result = new models.CustomResult().withResult(res.toView());
    await next();
  }

  static async create(ctx, next) {
    const { __cc, __sc } = ctx.state.baseInfo;

    const mReq = new CreateRoleDefaultServiceRequest().bind(ctx.request.body).checkRequired();
    const serviceGroupRes = await ServiceGroupRepository.findById(mReq.serviceGroupId);
    if (!serviceGroupRes) { throw new models.CustomError(coreErrorCodes.ERR_SERVICE_GROUP_ID_NOT_EXIST); }

    const entity = new RoleDefaultServiceEntity().bind(mReq).bindBaseInfo({ __cc, __sc });
    switch (mReq.role) {
      case employeeRoleCodes.Manager:
      case employeeRoleCodes.Operator:
        entity.withManageAuthLevel(manageAuthLevelCodes.Manager);
        break;
      case employeeRoleCodes.Supervisor:
        entity.withManageAuthLevel(manageAuthLevelCodes.Supervisor);
        break;
      default:
        entity.withManageAuthLevel(manageAuthLevelCodes.Normal);
        break;
    }
    await RoleDefaultServiceRepository.create(entity);

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async update(ctx, next) {
    const { roleDefaultServiceId } = ctx.params;
    const { pageAuth, reportAuth } = ctx.request.body;
    const { __vn } = ctx.state.baseInfo;

    const res = await RoleDefaultServiceRepository.findById(roleDefaultServiceId);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    tools.CustomValidator.isEqual(res.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    res.withPageAuth(pageAuth).withReportAuth(reportAuth).bindBaseInfo(ctx.state.baseInfo);
    await RoleDefaultServiceRepository.updateById(roleDefaultServiceId, res);
    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = ServiceGroupController;
