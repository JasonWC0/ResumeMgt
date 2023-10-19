/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { models } = require('@erpv3/app-common');
const { CaseStatusHistoryRepository } = require('@erpv3/app-core/infra/repositories');
const { CaseStatusHistoryEntity } = require('@erpv3/app-core/domain');
const CreateCaseStatusHistoryRequest = require('./req-objects/create-case-status-history-request');

class CaseStatusHistoryController {
  static async upsert(ctx, next) {
    const { personId } = ctx.state.user;
    const { __cc, __sc } = ctx.state.baseInfo;
    const req = new CreateCaseStatusHistoryRequest()
      .bind(ctx.request.body)
      .checkRequired();

    let oCaseStatus = await CaseStatusHistoryRepository.findByCaseId(req.caseId);
    if (!oCaseStatus) {
      oCaseStatus = new CaseStatusHistoryEntity()
        .bind(req)
        .bindBaseInfo({ __cc, __sc })
        .bindCreator(personId);
      await CaseStatusHistoryRepository.create(oCaseStatus);
    } else {
      oCaseStatus.bind(ctx.request.body)
        .bindModifier(personId);
      await CaseStatusHistoryRepository.updateByCaseId(oCaseStatus);
    }

    ctx.state.result = new models.CustomResult().withResult(oCaseStatus);
    await next();
  }
}

module.exports = CaseStatusHistoryController;
