/**
 * FeaturePath: 經營管理-系統管理-機構服務設定-集團總公司基本資料
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
const initData = require('./data/corporation.json');

const create = async() => {
  const col = NativeDBClient.getCollection(modelCodes.CORPORATION);
  const objs = initData.data;
  for (const obj of objs) {
    obj._id = new ObjectId(obj._id);
    obj.valid = true; 
  }

  await col.deleteMany({});
  await col.insertMany(objs);
}

module.exports = {
  create,
};
