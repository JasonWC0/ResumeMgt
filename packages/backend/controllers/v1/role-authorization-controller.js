/**
 * FeaturePath: 經營管理-系統管理-機構服務設定-新增員工角色權限設定
 * FeaturePath: 經營管理-系統管理-機構服務設定-複製員工角色權限設定
 * FeaturePath: 經營管理-系統管理-機構服務設定-編輯員工角色權限設定
 * FeaturePath: 經營管理-系統管理-機構服務設定-檢視員工角色權限設定
 * FeaturePath: 經營管理-系統管理-機構服務設定-刪除員工角色權限設定
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: role-authorization-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-04-18 11:50:43 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models, codes, tools } = require('@erpv3/app-common');
const { CreateRoleAuthorizationRequest, CopyRoleAuthorizationRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { RoleAuthorizationRepository, CompanyRepository, EmployeeRepository } = require('@erpv3/app-core/infra/repositories');
const { RoleAuthorizationEntity, coreErrorCodes } = require('@erpv3/app-core/domain');

class RoleAuthorizationController {
  static async _checkNameDuplicate(companyId, newName) {
    const roleAuthResList = await RoleAuthorizationRepository.findByCompany(companyId);
    const roleNames = roleAuthResList.map((r) => r.name);
    if (roleNames.includes(newName)) { throw new models.CustomError(coreErrorCodes.ERR_THE_ROLE_NAME_IS_EXIST); }
  }

  static async read(ctx, next) {
    const { roleAuthorizationId } = ctx.params;
    const res = await RoleAuthorizationRepository.findById(roleAuthorizationId);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    ctx.state.result = new models.CustomResult().withResult(res.toView());
    await next();
  }

  static async create(ctx, next) {
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new CreateRoleAuthorizationRequest().bind(ctx.request.body).checkRequired();
    const companyRes = await CompanyRepository.findById(mReq.companyId);
    if (!companyRes) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND); }
    await RoleAuthorizationController._checkNameDuplicate(mReq.companyId, mReq.name);

    const role = await RoleAuthorizationRepository.generateRoleNumber();
    const entity = new RoleAuthorizationEntity()
      .bind(mReq)
      .bindBaseInfo({ __cc, __sc })
      .withRole(role)
      .withIsDefault(false);
    await RoleAuthorizationRepository.create(entity);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async copy(ctx, next) {
    const { __cc, __sc } = ctx.state.baseInfo;
    const mReq = new CopyRoleAuthorizationRequest().bind(ctx.request.body).checkRequired();
    const companyRes = await CompanyRepository.findById(mReq.companyId);
    if (!companyRes) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_NOT_FOUND); }
    const roleAuthRes = await RoleAuthorizationRepository.findById(mReq.roleAuthorizationId);
    if (!roleAuthRes) { throw new models.CustomError(coreErrorCodes.ERR_ROLE_AUTHORIZATION_ID_NOT_EXIST); }
    tools.CustomValidator.isEqual(mReq.companyId, roleAuthRes.companyId, coreErrorCodes.ERR_COMPANY_ID_IS_DIFF);
    await RoleAuthorizationController._checkNameDuplicate(mReq.companyId, mReq.name);

    const role = await RoleAuthorizationRepository.generateRoleNumber();
    const entity = new RoleAuthorizationEntity().bind(mReq)
      .withRole(role)
      .withIsDefault(false)
      .withPageAuth(roleAuthRes.pageAuth)
      .withReportAuth(roleAuthRes.reportAuth)
      .bindBaseInfo({ __cc, __sc });
    await RoleAuthorizationRepository.create(entity);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async update(ctx, next) {
    const { roleAuthorizationId } = ctx.params;
    const { pageAuth, reportAuth } = ctx.request.body;
    const { __vn } = ctx.state.baseInfo;

    const res = await RoleAuthorizationRepository.findById(roleAuthorizationId);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    tools.CustomValidator.isEqual(res.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    res.withPageAuth(pageAuth).withReportAuth(reportAuth).bindBaseInfo(ctx.state.baseInfo);
    await RoleAuthorizationRepository.updateById(roleAuthorizationId, res);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async delete(ctx, next) {
    const { roleAuthorizationId } = ctx.params;

    const res = await RoleAuthorizationRepository.findById(roleAuthorizationId);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    if (res.isDefault) { throw new models.CustomError(coreErrorCodes.ERR_THE_ROLE_IS_DEFAULT); }

    // check the role is not in used
    const personListRes = await EmployeeRepository.listByCompanyId(res.companyId);
    const roleExist = personListRes.some((person) => person.employee.comPersonMgmt.some((com) => com.roles.includes(res.role)));
    if (roleExist) { throw new models.CustomError(coreErrorCodes.ERR_THE_ROLE_IN_USED); }

    await RoleAuthorizationRepository.delete(roleAuthorizationId, ctx.state.baseInfo);
    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = RoleAuthorizationController;
