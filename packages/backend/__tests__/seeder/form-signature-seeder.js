/**
 * FeaturePath: 經營管理-評鑑管理-逐案分析-日照評鑑表單簽名
 * FeaturePath: 個案管理-評估-評估管理-評估表單簽名
 * Accountable: JoyceS Hsu, Wilbert Yang
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-signature-seeder.js
 * Project: @erpv3/backend
 * File Created: 2022-06-30 03:10:07 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const customTools = require('../basic/custom-tools');
const NativeDBClient = require('../basic/native-db-client');
const modelCodes = require('../enums/model-codes');
const initData = require('./data/form-signature.json');

const create = async() => {
  const col = NativeDBClient.getCollection(modelCodes.FORMSIGNATURE);
  const objs = initData.data;

  await col.deleteMany({});
  const convertObjs = [];
  for (const obj of objs) {
    convertObjs.push(customTools.convertId(obj));
  }
  await col.insertMany(convertObjs);
}

module.exports = {
  create,
};
