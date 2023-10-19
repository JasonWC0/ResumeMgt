/* eslint-disable import/no-extraneous-dependencies */
/**
 * FeaturePath: 經營管理-業務管理-服務管理-政府服務項目
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: service-item-seeder.js
 * Project: @erpv3/backend
 * File Created: 2022-06-13 04:31:55 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongodb');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { modelCodes } = require('@erpv3/app-core/domain/index');
const initData = require('./data/service-item.json');

const checkUpdate = async () => {
  const col = DefaultDBClient.getCollection(modelCodes.SERVICEITEM);
  const objs = initData.data;

  for await (const obj of objs) {
    obj._id = new ObjectId(obj._id);
    obj.createdAt = new Date(obj.createdAt);
    obj.updatedAt = new Date(obj.updatedAt);
    const origin = await col.findById(obj._id);
    if (!origin) {
      await col.create(obj);
      continue;
    }
    if (obj.__vn > origin.__vn) {
      await col.updateOne({ _id: origin._id }, obj);
    }
  }
};

module.exports = {
  checkUpdate,
};
