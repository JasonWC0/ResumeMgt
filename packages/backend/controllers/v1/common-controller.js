/**
 * FeaturePath: 經營管理-系統管理-機構服務設定-基本資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: common-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-07-27 01:55:44 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models } = require('@erpv3/app-common');
const { BankRepository } = require('@erpv3/app-core/infra/repositories');
const BankListResponse = require('./res-objects/bank-list-response');

class CommonController {
  static async bankList(ctx, next) {
    const bankResList = await BankRepository.findAll();

    const response = new BankListResponse();
    response.list = bankResList;
    ctx.state.result = new models.CustomResult().withResult(response.toView());
    await next();
  }
}

module.exports = CommonController;
