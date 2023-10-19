/* eslint-disable object-curly-newline */
/**
 * FeaturePath: 個案管理-服務流程管理-暫停結案-v2.5取得服務筆數API串接
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-service-record-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-10-20 11:53:20 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { models } = require('@erpv3/app-common');
const { ReadCaseServiceRecordListRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { CaseStatusHistoryToV25Service } = require('@erpv3/app-core/application/service');
const { companyServiceCodes } = require('@erpv3/app-core/domain');

class CaseServiceRecordController {
  static async list(ctx, next) {
    const mReq = new ReadCaseServiceRecordListRequest().bind(ctx.request.query).checkRequired();
    const { service, total } = mReq;
    const { companyId } = ctx.state.baseInfo;
    const { cookie } = ctx.request.headers;

    const response = {};
    // ask erp2.5
    if (total && [companyServiceCodes.DC, companyServiceCodes.HC].includes(service)) {
      const count = await CaseStatusHistoryToV25Service.countServiceRecord(cookie, companyId, mReq.caseId, mReq.service, mReq.startDate, mReq.endDate);
      response.total = count;
    }

    ctx.state.result = new models.CustomResult().withResult(response);
    await next();
  }
}

module.exports = CaseServiceRecordController;
