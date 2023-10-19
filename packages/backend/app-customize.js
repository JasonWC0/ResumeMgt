/**
 * FeaturePath: Common-System--
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: app-customize.js
 * Project: @erpv3/backend
 * File Created: 2022-04-28 02:33:28 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models, codes } = require('@erpv3/app-common');
const { CustomUtils, CustomValidator, customRequestTracer } = require('@erpv3/app-common/custom-tools');
const conf = require('@erpv3/app-common/shared/config');
const { RegisterOperatorRequest } = require('@erpv3/app-core/application/contexts/req-objects');

const CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/;

class AppCustomize {
  static async parseHeaders(ctx, next) {
    const takeHeaders = ['vn', 'cc', 'sc', 'companyId', 'X-Operator-Info', conf.REGISTER.KEY];
    const headersData = takeHeaders.reduce((acc, curr) => {
      acc[curr] = ctx.request.header[curr.toLowerCase()];
      return acc;
    }, {});

    // parse Register >> Authorization: basic {client_secret}
    const match = CREDENTIALS_REGEXP.exec(headersData[conf.REGISTER.KEY]);
    if (match) {
      ctx.state.basicKey = match[1] || '';
    }

    // parse embed-formResult operator
    if (headersData['X-Operator-Info']) {
      try {
        const operatorObj = JSON.parse(CustomUtils.fromBase64ToString(headersData['X-Operator-Info']));
        const operatorReq = new RegisterOperatorRequest().bind(operatorObj).checkRequired();

        ctx.state.operator = {
          companyId: operatorReq.companyId,
          region: operatorReq.region,
          personId: operatorReq.personId,
          name: operatorReq.name,
          account: operatorReq.account,
        };
      } catch {
        throw new models.CustomError(codes.errorCodes.ERR_AUTHORIZATION);
      }
    }

    // structure basicInfo
    const num = Number.parseInt(headersData.vn, 10);
    ctx.state.baseInfo = {
      __vn: Number.isNaN(num) ? null : num,
      __cc: CustomValidator.nonEmptyString(headersData.cc) ? headersData.cc : customRequestTracer.getId(),
      __sc: headersData.sc || '',
      companyId: headersData.companyId || '',
    };
    return next();
  }
}

module.exports = AppCustomize;
