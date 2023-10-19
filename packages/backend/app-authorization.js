/* eslint-disable object-curly-newline */
/* eslint-disable no-use-before-define */
/**
 * FeaturePath: Common-System--
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: app-authorization.js
 * Project: @erpv3/backend
 * File Created: 2022-02-08 04:51:49 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models, codes, tools, LOGGER } = require('@erpv3/app-common');
const conf = require('@erpv3/app-common/shared/config');
const { TokenRepository } = require('@erpv3/app-core/infra/repositories');

const AUTH_ERROR = 'AuthError';
const BASEINFO_ERROR = 'BasicInfoError';
const adminRoute = '{conf.SERVICE.PREFIX}/admin/api.*';
const tokenByPass = [
  `${conf.SERVICE.PREFIX}`,
  `${conf.SERVICE.PREFIX}/files`,
  `${conf.SERVICE.PREFIX}/api-docs`,
  `${conf.SERVICE.PREFIX}/app/api/v1/login`,
  `${conf.SERVICE.PREFIX}/app/api/v1/logout`,
  `${conf.SERVICE.PREFIX}/app/api/v1`,
  `${conf.SERVICE.PREFIX}/app/api/v1/throws`];
const headerByPass = [
  '{conf.SERVICE.PREFIX}',
  '{conf.SERVICE.PREFIX}/files',
  '{conf.SERVICE.PREFIX}/api-docs',
  '{conf.SERVICE.PREFIX}/app/api/v1/login',
  '{conf.SERVICE.PREFIX}/app/api/v1/logout',
  '{conf.SERVICE.PREFIX}/app/api/v1',
  '{conf.SERVICE.PREFIX}/app/api/v1/throws',
  '{conf.SERVICE.PREFIX}/app/api/v1/accountInfo',
  '{conf.SERVICE.PREFIX}/app/api/v1/changePassword',
  '{conf.SERVICE.PREFIX}/app/api/v1/accounts/(.*)/changePasswordById',
  '{conf.SERVICE.PREFIX}/app/api/v1/resetPassword',
  '{conf.SERVICE.PREFIX}/app/api/v1/storages/t.*',
  '{conf.SERVICE.PREFIX}/app/api/v1/token/extension',
  '{conf.SERVICE.PREFIX}/admin/api.*',
  '{conf.SERVICE.PREFIX}/migration/api.*'];
const patchByPass = [
  `${conf.SERVICE.PREFIX}/app/api/v1/medicineRecords/batch/caseStatus`,
  `${conf.SERVICE.PREFIX}/app/api/v1/medicineRecords/batch/scheduleStatus`
];

/**
* auth
* @param {object} opts options
* @param {boolean} passThrough 是否皆byPass
* @returns
*/
module.exports = (opts = {}) => {
  const { passThrough } = opts;
  return async function auth(ctx, next) {
    if (!ctx.path.startsWith(conf.SERVICE.PREFIX)) { return next(); }

    _baseInfoCheck(ctx);
    _adminAuth(ctx);
    _basicAuth(ctx, passThrough);
    await _tokenAuth(ctx);
    return next();
  };
};

function _headerByPass(ctx) {
  return headerByPass.some((val) => {
    const url = val.replace('{conf.SERVICE.PREFIX}', conf.SERVICE.PREFIX);

    // if the url doesn't include (.*)，comparing with the request url directly
    if (!url.includes('.*')) {
      return url === ctx.request.url;
    }

    const regex = new RegExp(url);
    return regex.test(ctx.request.url);
  });
}

function _baseInfoCheck(ctx) {
  try {
    const { companyId, __sc, __vn, __cc } = ctx.state.baseInfo;
    LOGGER.info(`${ctx.method} ${ctx.path} - [${__cc}] - sc:${__sc}, companyId:${companyId}, vn:${__vn},`);

    const result = _headerByPass(ctx);
    if (result) return;

    if (!tools.CustomValidator.nonEmptyString(companyId) || !tools.CustomValidator.nonEmptyString(__sc)) {
      throw BASEINFO_ERROR;
    }

    if (tools.CustomValidator.isEqual(ctx.method.toUpperCase(), 'PATCH')) {
      if (patchByPass.includes(ctx.request.url)) { return; }
      if (!tools.CustomValidator.isNumber(__vn)) { throw BASEINFO_ERROR; }
    }
  } catch (e) {
    throw new models.CustomError(codes.errorCodes.ERR_HEADERS_INCOMPLETE);
  }
}

function _basicAuth(ctx, passThrough) {
  // check basic auth
  try {
    if (!ctx.state.basicKey) { return; }

    const clients = conf.REGISTER.CLIENTS;
    const basicUser = clients.find((c) => c.CLIENT_SECRET === ctx.state.basicKey);
    if (!basicUser) { throw AUTH_ERROR; }
    ctx.state.basicClient = { name: basicUser.DOMAIN };
  } catch (e) {
    if (!passThrough) throw new models.CustomError(codes.errorCodes.ERR_AUTHORIZATION);
  }
}

function _adminAuth(ctx) {
  try {
    const url = adminRoute.replace('{conf.SERVICE.PREFIX}', conf.SERVICE.PREFIX);
    const regex = new RegExp(url);
    if (!regex.test(ctx.request.url)) { return; }
    if (!ctx.get(conf.ADMIN_AUTH.KEY)) { throw AUTH_ERROR; }
    if (ctx.get(conf.ADMIN_AUTH.KEY) !== conf.ADMIN_AUTH.VALUE) { throw AUTH_ERROR; }
    ctx.state.admin = true;
  } catch (e) {
    throw new models.CustomError(codes.errorCodes.ERR_AUTHORIZATION);
  }
}

async function _tokenAuth(ctx) {
  try {
    if (ctx.state.basicClient) { return; }
    if (ctx.state.admin) { return; }

    const tokenRes = ctx.state.user ? await TokenRepository.findByToken(ctx.state.tokenKey) : null;

    if (!ctx.state.user || !tokenRes) {
      if (
        !tokenByPass.includes(ctx.request.url)
      ) { throw AUTH_ERROR; }
    }

    if (tokenRes) {
      ctx.state.user.corpId = tokenRes.corpId;
      ctx.state.user.accountId = tokenRes.accountId;
      ctx.state.user.account = tokenRes.account;
      ctx.state.user.personId = tokenRes.personId;
      ctx.state.user.keycloakId = tokenRes.keycloakId;
      ctx.state.user.name = tokenRes.name;
      ctx.state.user.companies = tokenRes.companies;
    }

    // by-pass header pass route
    if (_headerByPass(ctx)) { return; }

    // check baseInfo's companyId in the token companies
    // if (!tokenByPass.includes(ctx.request.url) && !Object.keys(ctx.state.user.companies).includes(ctx.state.baseInfo.companyId)) {
    //   throw AUTH_ERROR;
    // }
  } catch (e) {
    throw new models.CustomError(codes.errorCodes.ERR_AUTHORIZATION);
  }
}
