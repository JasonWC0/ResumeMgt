/* eslint-disable object-curly-newline */
/**
 * FeaturePath: 經營管理-評鑑管理-逐案分析-新增公司日照評鑑表單範本列表
 * FeaturePath: 經營管理-評鑑管理-逐案分析-編輯公司日照評鑑表單範本列表
 * FeaturePath: 個案管理-評估-評估管理-新增公司評估表單範本列表
 * FeaturePath: 個案管理-評估-評估管理-編輯公司評估表單範本列表
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-controller.js
 * Project: @erpv3/backend
 * File Created: 2022-05-10 06:41:40 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { FormEntity } = require('@erpv3/app-core/domain');
const { FormRepository } = require('@erpv3/app-core/infra/repositories');

class FormController {
  static async seeder(ctx, next) {
    const { data } = ctx.request.body;

    const create = [];
    const cannot = [];
    await Promise.all(
      data.map(async (value) => {
        const entity = new FormEntity().bind(value);
        const { companyId, category, type, inUse, version, __vn } = entity;
        if (!inUse) {
          cannot.push(value);
        } else {
          const res = await FormRepository.findOne({ companyId, category, type, inUse });
          if (!res) {
            create.push(entity);
          } else if (res.version === version) {
            if (res.__vn < __vn) {
              await FormRepository.updateById(res.formId, entity, true);
            } else {
              cannot.push(value);
            }
          } else {
            await FormRepository.noUseById(res.formId, ctx.state.baseInfo);
            create.push(entity);
          }
        }
      })
    );

    if (CustomValidator.nonEmptyArray) {
      await FormRepository.createMulti(create);
    }

    ctx.state.result = new models.CustomResult().withResult({ notInsert: cannot });
    await next();
  }
}

module.exports = FormController;
