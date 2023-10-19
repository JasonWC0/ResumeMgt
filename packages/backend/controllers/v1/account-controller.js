/* eslint-disable object-curly-newline */
/**
 * FeaturePath: 經營管理-系統管理-帳號權限-登入
 * FeaturePath: 經營管理-系統管理-帳號權限-登出
 * FeaturePath: 經營管理-系統管理-帳號權限-新增帳號
 * FeaturePath: 經營管理-系統管理-帳號權限-檢視帳號
 * FeaturePath: 經營管理-系統管理-帳號權限-編輯帳號
 * FeaturePath: 經營管理-系統管理-帳號權限-刪除帳號
 * FeaturePath: 經營管理-系統管理-帳號權限-修改密碼
 * FeaturePath: 經營管理-系統管理-帳號權限-重設密碼
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: account-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-03-23 11:04:39 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const moment = require('moment');
const fsExtra = require('fs-extra');
const jwt = require('jsonwebtoken');
const { models, codes } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const conf = require('@erpv3/app-common/shared/config');
const { LoginRequest, CreateAccountRequest, UpdateAccountPasswordRequest,
  UpdateAccountRequest, ResetAccountPasswordRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { AccountService } = require('@erpv3/app-core/application/service');
const { TokenEntity, AccountEntity, coreErrorCodes, accountTypeCodes } = require('@erpv3/app-core/domain');
const {
  AccountRepository,
  TokenRepository,
  PersonRepository,
  CompanyRepository,
  CorporationRepository,
  RoleAuthorizationRepository,
  MarqueeSettingRepository,
} = require('@erpv3/app-core/infra/repositories');

class AccountController {
  static _checkEmployeeStatus(startDate, endDate) {
    const today = moment().startOf('day');
    if (!startDate) { return false; }
    if (moment(startDate).startOf('day').isAfter(today, 'days')) { return false; }
    if (!endDate) { return true; }
    return moment(endDate).startOf('day').isSameOrAfter(today, 'days');
  }

  static async login(ctx, next) {
    const mReq = new LoginRequest().bind(ctx.request.body).checkRequired();
    const accountRes = await AccountService.authCheck(mReq.account, mReq.pwd);
    if (!accountRes) { throw new models.CustomError(codes.errorCodes.ERR_AUTHORIZATION); }
    const { personId, corpId, account, keycloakId } = accountRes;
    const accountId = accountRes.id;
    const payload = {
      personId,
    };
    const token = jwt.sign(payload, conf.TOKEN.SECRET);

    const corpRes = await CorporationRepository.findById(corpId);
    // [2020-11-07] Migration: Set variable migration corporation (Boolean)
    const migrationCorp = CustomValidator.isEqual(corpRes.code, conf.MIGRATION.COMPANY_CODE);

    if (migrationCorp) {
      ctx.state.result = new models.CustomResult().withResult({ accountId });
    } else {
      // take name
      const keys = await fsExtra.readJson(corpRes.__enc.provider);
      const secretKey = keys[corpRes.__enc.keyId];
      const { name, employee } = await (await PersonRepository.findById(personId)).withKey(secretKey.key).withIv(secretKey.iv).decryption();

      const defaultPageAuthPath = './packages/backend/configs/default/pageAuth.json';
      const defaultPageAuth = await fsExtra.readJson(defaultPageAuthPath);
      const subKeys = Object.keys(defaultPageAuth);
      const companiesData = {};
      // [2020-08-10] Migration: Set variable migration company(Boolean)
      let migrationCom = false;

      if (employee) {
        const { comPersonMgmt } = employee;
        const data = {};
        comPersonMgmt.forEach((comMgmtData) => {
          data[comMgmtData.companyId.toString()] = {
            roles: comMgmtData.roles,
            startDate: comMgmtData.startDate,
            endDate: comMgmtData.endDate,
          };
        });

        const selectObj = {
          code: 1,
          fullName: 1,
          service: 1,
          cityCode: 1,
          'systemSetting.serviceItemBA02Unit': 1,
          serviceGroupId: 1,
          importERPv3: 1,
          createdAt: 1,
          pageAuth: 1,
        };
        const companyInfos = await CompanyRepository.findByIds(Object.keys(data), selectObj);
        // [2020-08-10] Migration: Check is migration company or not
        migrationCom = companyInfos.some((c) => CustomValidator.isEqual(c.code, conf.MIGRATION.COMPANY_CODE));

        if (!migrationCom) {
          await Promise.all(
            companyInfos.map(async (obj) => {
              const { id, fullName, service, cityCode, systemSetting, serviceGroupId, importERPv3, createdAt, pageAuth } = obj;
              if (AccountController._checkEmployeeStatus(data[id].startDate, data[id].endDate)) {
                const marqueeSetEntity = await MarqueeSettingRepository.findByCompanyId(id);
                const roleAuthes = await RoleAuthorizationRepository.findByCompany(id);
                const roleAuth = roleAuthes.filter((value) => data[id].roles.includes(value.role));
                const manageAuthLevel = Math.min(...roleAuth.map((role) => role.manageAuthLevel));
                const pageAuthList = roleAuth.map((role) => role.pageAuth);
                const pageAuthListExist = CustomValidator.nonEmptyArray(pageAuthList);

                const _pageAuth = {};
                for (const key1 of subKeys) {
                  const layer2Keys = Object.keys(defaultPageAuth[key1]);
                  _pageAuth[key1] = {};
                  for (const key2 of layer2Keys) {
                    if (!pageAuth || !pageAuth[key1] || !pageAuth[key1][key2]) {
                      _pageAuth[key1][key2] = 0;
                      continue;
                    }
                    _pageAuth[key1][key2] = pageAuthListExist ? Math.max(...pageAuthList.map((value) => ((value[key1]) ? (value[key1][key2] ? value[key1][key2] : 0) : 0))) : 0;
                  }
                }
                const { serviceItemBA02Unit } = systemSetting;
                const _serviceGroupId = serviceGroupId ? serviceGroupId._id : '';
                const marqueeSetting = marqueeSetEntity ? { speed: marqueeSetEntity.speed, contents: marqueeSetEntity.contents } : {};
                companiesData[id] = { fullName, serviceGroupId: _serviceGroupId, service, marqueeSetting, cityCode, serviceItemBA02Unit, roles: data[id].roles, pageAuth: _pageAuth, manageAuthLevel, importERPv3, createdAt: new Date(createdAt) };
              }
            })
          );
        }
      }

      // [2020-08-10] Migration: Response depends on is migration company or not
      if (!migrationCom) {
        // at least one company authorization
        CustomValidator.nonEmptyObject(companiesData, codes.errorCodes.ERR_AUTHORIZATION);
        // sort by company's createdAt
        const companies = {};
        Object.entries(companiesData).sort((a, b) => a[1].createdAt - b[1].createdAt).forEach((val) => {
          const key = val[0];
          const value = val[1];
          companies[key] = value;
          delete companies[key].createdAt;
        });

        const entity = new TokenEntity().bind({
          token,
          companies,
          personId,
          name,
          accountId,
          account,
          corpId,
          keycloakId,
        });
        const tokenRes = await TokenRepository.create(entity);
        ctx.state.result = new models.CustomResult().withResult({ token, id: tokenRes.id });
      } else {
        ctx.state.result = new models.CustomResult().withResult({ accountId });
      }
    }
    await next();
  }

  static async logout(ctx, next) {
    const { keycloakId } = ctx.state.user;
    await AccountService.logout(keycloakId);
    const token = ctx.state.tokenKey;
    await TokenRepository.deleteByToken(token);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async getInfo(ctx, next) {
    const tokenEntity = new TokenEntity().bind(ctx.state.user);
    ctx.state.result = new models.CustomResult().withResult(tokenEntity.toView());
    await next();
  }

  static async create(ctx, next) {
    const mReq = new CreateAccountRequest().bind(ctx.request.body).checkRequired();
    const baseInfo = { ...ctx.state.baseInfo, __vn: 0 };
    const entity = new AccountEntity().bind(mReq).bindBaseInfo(baseInfo);
    const accountRes = await AccountService.create(entity);
    ctx.state.result = new models.CustomResult().withResult({ id: accountRes.id });
    await next();
  }

  static async changePasswordById(ctx, next) {
    const { accountId } = ctx.params;
    const mReq = new UpdateAccountPasswordRequest().bind(ctx.request.body).checkRequired();
    const accountDbRes = await AccountRepository.findById(accountId);
    if (!accountDbRes) { throw new models.CustomError(coreErrorCodes.ERR_ACCOUNT_NOT_FOUND); }
    const { account } = accountDbRes;
    const accountRes = await AccountService.authCheck(account, mReq.oldPassword);
    if (!accountRes) { throw new models.CustomError(coreErrorCodes.ERR_OLD_PASSWORD_WRONG); }

    await AccountService.changePassword(account, mReq.newPassword);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async changePassword(ctx, next) {
    const mReq = new UpdateAccountPasswordRequest().bind(ctx.request.body).checkRequired();
    const { account } = ctx.state.user;
    const accountRes = await AccountService.authCheck(account, mReq.oldPassword);
    if (!accountRes) { throw new models.CustomError(coreErrorCodes.ERR_OLD_PASSWORD_WRONG); }

    await AccountService.changePassword(account, mReq.newPassword);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async resetPassword(ctx, next) {
    const mReq = new ResetAccountPasswordRequest().bind(ctx.request.body).checkRequired();
    const res = await AccountRepository.findByAccount(mReq.account);
    if (!res) { throw new models.CustomError(coreErrorCodes.ERR_ACCOUNT_NOT_FOUND); }

    await AccountService.changePassword(mReq.account, mReq.newPassword);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async update(ctx, next) {
    const { account } = ctx.params;
    const { __vn } = ctx.state.baseInfo;
    const mReq = new UpdateAccountRequest().bind(ctx.request.body).checkRequired();

    const res = await AccountRepository.findByAccount(account);
    if (!res) { throw new models.CustomError(coreErrorCodes.ERR_ACCOUNT_NOT_FOUND); }

    CustomValidator.isEqual(res.__vn, __vn, codes.errorCodes.ERR_DATA_VN_FAIL);

    res.bindBaseInfo(ctx.state.baseInfo);
    let updateOtherInfo = false;
    if (CustomValidator.nonEmptyString(mReq.corpId)) {
      const corpRes = await CorporationRepository.findById(mReq.corpId);
      if (!corpRes) { throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_NOT_FOUND); }
      res.corpId = mReq.corpId;
      updateOtherInfo = true;
    }
    if (mReq.type) {
      res.type = mReq.type;
      if (CustomValidator.isEqual(mReq.type, accountTypeCodes.customer)) { res.companyAdmin = false; }
      updateOtherInfo = true;
    }
    if (updateOtherInfo) { await AccountRepository.updateById(res.id, res); }

    if (CustomValidator.nonEmptyObject(mReq.newAccount)) {
      await AccountService.reNewAccount(res, mReq.newAccount);
    }
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async deleteList(ctx, next) {
    const { corpId } = ctx.request.query;
    if (!corpId) { throw new models.CustomError(coreErrorCodes.ERR_CORPORATION_ID_IS_EMPTY); }
    await AccountService.deleteByCorp(corpId);
    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async checkExist(ctx, next) {
    const { account, id } = ctx.request.query;
    if (!account && !id) { throw new models.CustomError(coreErrorCodes.ERR_ACCOUNT_IS_EMPTY); }
    const res = account ? await AccountRepository.findByAccount(account) : await AccountRepository.findById(id);
    const exist = !!res;
    const accountData = exist ? res.toView() : {};
    ctx.state.result = new models.CustomResult().withResult({ exist, accountData });
    await next();
  }

  static async read(ctx, next) {
    const { accountId } = ctx.params;
    const res = await AccountRepository.findById(accountId);
    if (!res) { throw new models.CustomError(coreErrorCodes.ERR_ACCOUNT_NOT_FOUND); }

    ctx.state.result = new models.CustomResult().withResult(res);
    await next();
  }

  static async delete(ctx, next) {
    const { account } = ctx.params;
    await AccountService.delete(account);

    ctx.state.result = new models.CustomResult();
    await next();
  }

  static async tokenExtension(ctx, next) {
    const { token } = ctx.request.body;
    if (!CustomValidator.nonEmptyString(token)) {
      throw new models.CustomError(coreErrorCodes.ERR_TOKEN_WRONG_VALUE);
    }
    const updatedAt = new Date();
    const res = await TokenRepository.update({ token }, { updatedAt }, { timestamps: false });
    ctx.state.result = new models.CustomResult(res);
    await next();
  }
}

module.exports = AccountController;
