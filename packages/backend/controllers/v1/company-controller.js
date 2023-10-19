/* eslint-disable no-case-declarations */
/**
 * FeaturePath: 經營管理-系統管理-機構服務設定-新增機構
 * FeaturePath: 經營管理-系統管理-機構服務設定-刪除機構
 * FeaturePath: 經營管理-系統管理-機構服務設定-編輯基本資料
 * FeaturePath: 經營管理-系統管理-機構服務設定-編輯機構服務進階設定
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-編輯跑馬燈設定
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-機構服務類型(編輯類型)
 * FeaturePath: 經營管理-系統管理-機構服務設定-檢視基本資料
 * FeaturePath: 經營管理-系統管理-機構服務設定-檢視機構服務進階設定
 * FeaturePath: 經營管理-系統管理-機構服務設定-檢視員工角色權限設定
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-檢視跑馬燈設定
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-檢視服務類型(編輯類型)
 * FeaturePath: 經營管理-評鑑管理-逐案分析-檢視公司日照評鑑表單範本列表
 * FeaturePath: 個案管理-評估-評估管理-檢視公司評估表單範本列表
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: company-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-02-17 11:53:01 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models, codes, tools } = require('@erpv3/app-common');
const conf = require('@erpv3/app-common/shared/config');
const {
  UpdateCompanyInfoRequest, UpdateCompanyInstitutionSettingRequest, UpdateCompanyServiceGroupRequest,
  ReadCompanyFormListRequest, UpdateCompanyMarqueeSettingRequest,
} = require('@erpv3/app-core/application/contexts/req-objects');
const { CreateCompanyRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const {
  CompanyRepository, FormRepository, ServiceGroupRepository,
  AccountRepository, RoleAuthorizationRepository, EmployeeRepository,
  RoleDefaultServiceRepository, TokenRepository, MarqueeSettingRepository,
} = require('@erpv3/app-core/infra/repositories');
const { coreErrorCodes, RoleAuthorizationEntity } = require('@erpv3/app-core/domain');
const CompanyFormListResponse = require('./res-objects/company-form-list-response');
const CompanyListResponse = require('./res-objects/company-list-response');
const CompanyRoleAuthorizationListResponse = require('./res-objects/company-role-authorization-list-response');

const dataTypes = {
  info: 'info',
  systemSetting: 'systemSetting',
  institutionSetting: 'institutionSetting',
  forms: 'forms',
  serviceGroup: 'serviceGroup',
  roleAuthorizations: 'roleAuthorizations',
  marqueeSetting: 'marqueeSetting',
};

class CompanyController {
  static async _checkCompany(companyId, headerCompanyId) {
    const res = await CompanyRepository.findById(companyId);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    tools.CustomValidator.isEqual(companyId, headerCompanyId, coreErrorCodes.ERR_HEADER_COMPANY_ID_IS_DIFF);
    return res;
  }

  static async readList(ctx, next) {
    const companyResList = await CompanyRepository.findAll();
    const accountList = await AccountRepository.findCompanyAdmin();

    // eslint-disable-next-line array-callback-return
    const res = companyResList.map((value) => {
      accountList.forEach((accountData) => {
        if (!accountData.personObject) return;
        if (!accountData.personObject.employee) return;
        if (!accountData.personObject.employee.comPersonMgmt) return;
        const { employee } = accountData.personObject;
        const { comPersonMgmt } = employee;
        comPersonMgmt.forEach((data) => {
          if (!tools.CustomValidator.isEqual(data.companyId.toString(), value.id)) return;
          value.account = accountData.account;
        });
      });
      return value;
    });

    const response = new CompanyListResponse();
    response.list = res;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    next();
  }

  static async read(ctx, next) {
    const { companyId, _type } = ctx.params;
    if (!Object.values(dataTypes).includes(_type)) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    const res = await CompanyRepository.findById(companyId);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }

    let response = {};
    switch (_type) {
      case dataTypes.info:
        tools.CustomValidator.isEqual(companyId, ctx.state.baseInfo.companyId, coreErrorCodes.ERR_HEADER_COMPANY_ID_IS_DIFF);
        response = res.responseInfo(`${conf.SERVICE.HOST}`);
        break;
      case dataTypes.systemSetting:
        break;
      case dataTypes.institutionSetting:
        tools.CustomValidator.isEqual(companyId, ctx.state.baseInfo.companyId, coreErrorCodes.ERR_HEADER_COMPANY_ID_IS_DIFF);
        response = res.institutionSettingToView();
        break;
      case dataTypes.forms:
        ctx.request.query.companyId = companyId;
        const qbe = new ReadCompanyFormListRequest().bind(ctx.request.query);
        if (!qbe.history) { qbe.inUse = true; }
        const formRes = await FormRepository.findByCompany(companyId, qbe);
        const resData = new CompanyFormListResponse();
        resData.list = formRes;
        response = resData.toView();
        break;
      case dataTypes.roleAuthorizations:
        let roleAuthResList = await RoleAuthorizationRepository.findByCompany(companyId);
        const personListRes = await EmployeeRepository.listByCompanyId(companyId);
        roleAuthResList = roleAuthResList.map((roleAuth) => {
          const roleExist = personListRes.some((person) => person.employee.comPersonMgmt.some((com) => com.roles.includes(roleAuth.role)));
          roleAuth.isUsed = roleExist;
          return roleAuth;
        });
        const authResData = new CompanyRoleAuthorizationListResponse();
        authResData.list = roleAuthResList;
        response = authResData.toView();
        break;
      case dataTypes.marqueeSetting:
        const marqueeSettingRes = await MarqueeSettingRepository.findByCompanyId(companyId);
        if (!marqueeSettingRes) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
        response = marqueeSettingRes.toView();
        break;
      default:
        break;
    }
    ctx.state.result = new models.CustomResult().withResult(response);
    await next();
  }

  static async readInstitutionSetting(ctx, next) {
    const { companyId, _object } = ctx.params;
    const res = await CompanyController._checkCompany(companyId, ctx.state.baseInfo.companyId);

    const response = {};
    response[_object] = res.institutionSetting[_object];
    response.vn = res.__vn;

    ctx.state.result = new models.CustomResult().withResult(response);
    await next();
  }

  static async readSystemSetting(ctx, next) {
    const { companyId, _object } = ctx.params;
    const res = await CompanyController._checkCompany(companyId, ctx.state.baseInfo.companyId);

    const response = {};
    response[_object] = res.systemSetting[_object];
    response.vn = res.__vn;

    ctx.state.result = new models.CustomResult().withResult(response);
    await next();
  }

  static async updateInfo(ctx, next) {
    const { companyId } = ctx.params;
    const { __vn } = ctx.state.baseInfo;
    const companyRes = await CompanyController._checkCompany(companyId, ctx.state.baseInfo.companyId);
    const mReq = new UpdateCompanyInfoRequest().bind(ctx.request.body).checkRequired();

    tools.CustomValidator.isEqual(companyRes.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    companyRes.bind(mReq.dataObj).bindBaseInfo(ctx.state.baseInfo);
    const res = await CompanyRepository.updateById(companyId, companyRes);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL); }

    // if update fullName, need to update token
    if (tools.CustomValidator.nonEmptyString(mReq.dataObj.fullName)) {
      const key = `companies.${companyId}`;
      const updateKey = `companies.${companyId}.fullName`;
      await TokenRepository.update({ [key]: { $exists: true } }, { [updateKey]: mReq.dataObj.fullName });
    }

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async updateInstitutionSetting(ctx, next) {
    const { companyId } = ctx.params;
    const { __vn, __cc, __sc } = ctx.state.baseInfo;
    const companyRes = await CompanyController._checkCompany(companyId, ctx.state.baseInfo.companyId);
    const mReq = new UpdateCompanyInstitutionSettingRequest().bind(ctx.request.body).checkRequired(companyRes.service);

    tools.CustomValidator.isEqual(companyRes.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    mReq.bindSource(companyRes.institutionSetting);
    const obj = { institutionSetting: mReq, __cc, __sc };
    const res = await CompanyRepository.updateFieldsById(companyId, obj);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL); }
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async updateServiceGroup(ctx, next) {
    const { companyId } = ctx.params;
    const { __vn, __cc, __sc } = ctx.state.baseInfo;
    const companyRes = await CompanyRepository.findById(companyId);
    if (!companyRes) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    const mReq = new UpdateCompanyServiceGroupRequest().bind(ctx.request.body).checkRequired();

    tools.CustomValidator.isEqual(companyRes.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    const serviceGroupRes = await ServiceGroupRepository.findById(mReq.id);
    if (!serviceGroupRes) { throw new models.CustomError(coreErrorCodes.ERR_SERVICE_GROUP_ID_NOT_EXIST); }

    const obj = { serviceGroupId: serviceGroupRes._id, __cc, __sc };
    const res = await CompanyRepository.updateFieldsById(companyId, obj);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL); }

    // if init serviceGroup, generate role authorizations
    if (!tools.CustomValidator.nonEmptyString(companyRes.serviceGroupId)) {
      const roleDefaultList = await RoleDefaultServiceRepository.findByServiceGroupId(mReq.id);
      await Promise.all(roleDefaultList.map(async (_roleDefault) => {
        const roleAuth = new RoleAuthorizationEntity().bind(_roleDefault).withCompanyId(companyId).withIsDefault(true);
        RoleAuthorizationRepository.create(roleAuth);
      }));
    }
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async updateMarqueeSetting(ctx, next) {
    const { companyId } = ctx.params;
    const { personId } = ctx.state.user;
    const { __vn, __cc, __sc } = ctx.state.baseInfo;
    const mReq = new UpdateCompanyMarqueeSettingRequest().bind(ctx.request.body);

    const res = await MarqueeSettingRepository.findByCompanyId(companyId);
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_URI_NOT_FOUND); }
    tools.CustomValidator.isEqual(res.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    res.withSpeed(mReq.speed).withContents(mReq.contents).bindBaseInfo({ __cc, __sc }).bindModifier(personId);
    await MarqueeSettingRepository.updateByCompanyId(companyId, res);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async create(ctx, next) {
    const { __cc, __sc } = ctx.state.baseInfo;
    const entity = new CreateCompanyRequest()
      .bind(ctx.request.body)
      .bindBaseInfo({ __cc, __sc })
      .checkRequired();

    const codeResList = await CompanyRepository.findByQBE({ code: entity.code });
    if (codeResList.length > 0) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_CODE_IS_EXIST); }
    const shortNameResList = await CompanyRepository.findByQBE({ shortName: entity.shortName });
    if (shortNameResList.length > 0) { throw new models.CustomError(coreErrorCodes.ERR_COMPANY_SHORT_NAME_IS_EXIST); }

    const res = await CompanyRepository.create(entity);
    ctx.state.result = new models.CustomResult().withResult(res);
    await next();
  }

  static async delete(ctx, next) {
    const { companyId } = ctx.params;
    const { __cc, __sc } = ctx.state.baseInfo;

    const res = await CompanyRepository.deleteById(companyId, { __cc, __sc });
    if (!res) { throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL); }
    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = CompanyController;
