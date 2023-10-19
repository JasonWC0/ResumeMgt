/**
 * FeaturePath: 仁寶平台管理-營運管理-機構參數設定-機構開站
 * Accountable: JoyceS Hsu, Wilbert Yang
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: company-seeder.js
 * Project: @erpv3/backend
 * File Created: 2022-02-14 02:20:38 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongodb');
const NativeDBClient = require('../basic/native-db-client');
const modelCodes = require('../enums/model-codes');
const initData = require('./data/company.json');

const create = async() => {
  const col = NativeDBClient.getCollection(modelCodes.COMPANY);
  const objs = initData.data;
  for (const obj of objs) {
    obj._id = new ObjectId(obj._id);
    obj.corpId = new ObjectId(obj.corpId);
  }

  await col.deleteMany({});
  await col.insertMany(objs);
}

module.exports = {
  create,
};
