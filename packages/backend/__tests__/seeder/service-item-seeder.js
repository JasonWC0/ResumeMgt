/**
 * FeaturePath: 經營管理-業務管理-服務管理-自費服務項目
 * Accountable: JoyceS Hsu, Wilbert Yang
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: person-seeder.js
 * Project: @erpv3/backend
 * File Created: 2022-02-14 02:20:38 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongodb');
const NativeDBClient = require('../basic/native-db-client');
const modelCodes = require('../enums/model-codes');
const initData = require('./data/serviceItem.json');

const create = async() => {
  const col = NativeDBClient.getCollection(modelCodes.SERVICEITEM);
  const objs = initData.data;
  for (const obj of objs) {
    obj._id = new ObjectId(obj._id);
    obj.companyId = new ObjectId(obj.companyId);
  }

  await col.insertMany(objs);
}

module.exports = {
  create,
};
