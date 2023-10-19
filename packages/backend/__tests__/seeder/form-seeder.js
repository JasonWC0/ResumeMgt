/**
 * FeaturePath: 經營管理-評鑑管理-逐案分析-公司日照評鑑表單範本列表
 * FeaturePath: 個案管理-評估-評估管理-公司評估表單範本列表
 * Accountable: JoyceS Hsu, Wilbert Yang
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-seeder.js
 * Project: @erpv3/backend
 * File Created: 2022-03-07 05:00:42 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongodb');
const NativeDBClient = require('../basic/native-db-client');
const modelCodes = require('../enums/model-codes');
const initData = require('./data/form.json');

const create = async() => {
  const col = NativeDBClient.getCollection(modelCodes.FORM);
  const objs = initData.data;
  for (const obj of objs) {
    obj._id = new ObjectId(obj._id);
    obj.companyId = new ObjectId(obj.companyId);
    obj.signatures = obj.signatures.map((v) => new ObjectId(v));
  }

  await col.deleteMany({});
  await col.insertMany(objs);
}

module.exports = {
  create,
};
