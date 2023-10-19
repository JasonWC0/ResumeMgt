/* eslint-disable object-curly-newline */
/**
 * FeaturePath: Common-Model--表單簽名
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-signature.js
 * Project: @erpv3/app-core
 * File Created: 2022-06-30 01:44:25 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes } = require('../../domain');

const _schema = new BaseSchema(
  {
    // 簽名角色名稱
    label: {
      type: String,
      trim: true,
    },
    // 簽名title
    name: {
      type: String,
      trim: true,
    },
    // Luna可簽名角色列表
    lunaRoles: [{
      type: Number,
    }],
    // erpv3可簽名角色列表
    erpv3Roles: [{
      type: Number,
    }],
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.FORMSIGNATURE}s`,
  }
);

module.exports = {
  modelName: modelCodes.FORMSIGNATURE,
  schema: _schema,
};
