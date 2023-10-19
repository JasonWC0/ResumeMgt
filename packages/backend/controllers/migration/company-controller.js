/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: company-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-06-10 03:04:11 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models } = require('@erpv3/app-common');
const { CreateCompanyRequest } = require('@erpv3/app-core/application/contexts/req-objects');
const { RoleAuthorizationEntity, MarqueeSettingEntity } = require('@erpv3/app-core/domain');
const { CompanyRepository, RoleAuthorizationRepository, MarqueeSettingRepository } = require('@erpv3/app-core/infra/repositories');

class CompanyController {
  static async create(ctx, next) {
    const { __cc, __sc } = ctx.state.baseInfo;
    const entity = new CreateCompanyRequest()
      .bind(ctx.request.body)
      .bindBaseInfo({ __cc, __sc })
      .checkRequired();

    // create company
    const res = await CompanyRepository.create(entity);
    const companyId = res.id;

    // create role authorizations
    const { roleAuthorizations } = ctx.request.body;
    if (roleAuthorizations) {
      const roleAuthEntities = roleAuthorizations.map((roleAuth) => (
        new RoleAuthorizationEntity().bind(roleAuth).withCompanyId(companyId).bindBaseInfo({ __cc, __sc })
      ));
      await RoleAuthorizationRepository.createMulti(roleAuthEntities);
    }

    // create marquee setting
    const { marqueeSetting } = ctx.request.body;
    if (marqueeSetting) {
      const marqueeSettingEntity = new MarqueeSettingEntity()
        .bind(marqueeSetting)
        .withCompanyId(companyId)
        .bindBaseInfo({ __cc, __sc });
      await MarqueeSettingRepository.create(marqueeSettingEntity);
    }

    ctx.state.result = new models.CustomResult().withResult(res);
    await next();
  }
}

module.exports = CompanyController;
