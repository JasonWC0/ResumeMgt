/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: account-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-07-05 11:29:09 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models } = require('@erpv3/app-common');
const { AccountRepository } = require('@erpv3/app-core/infra/repositories');
const AccountListResponse = require('./res-objects/account-list-response');

class AccountController {
  static async readList(ctx, next) {
    const accountList = await AccountRepository.findAll();
    const response = new AccountListResponse();
    response.list = accountList;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }
}

module.exports = AccountController;
