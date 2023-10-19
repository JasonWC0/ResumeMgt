/**
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設功能
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: service-group-seeder.js
 * Project: @erpv3/backend
 * File Created: 2022-04-01 11:02:38 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { modelCodes } = require('@erpv3/app-core/domain/index');
const initData = require('./data/service-group.json');

const checkUpdate = async () => {
  const col = DefaultDBClient.getCollection(modelCodes.SERVICEGROUP);
  const objs = initData.data;

  for await (const obj of objs) {
    const origin = await col.findOne({ code: obj.code });
    if (!origin) {
      await col.create(obj);
      continue;
    }
    if (obj.__vn > origin.__vn) {
      // the same key priority: 1.db 2.json
      const { pageAuth, reportAuth } = origin;
      const newPageAuth = {};
      const newReportAuth = {};
      for (const key1 of Object.keys(obj.pageAuth)) {
        const layer2Keys = Object.keys(obj.pageAuth[key1]);
        newPageAuth[key1] = {};
        for (const key2 of layer2Keys) {
          newPageAuth[key1][key2] = Object.keys(pageAuth).includes(key1) ? (Object.keys(pageAuth[key1]).includes(key2) ? pageAuth[key1][key2] : obj.pageAuth[key1][key2]) : obj.pageAuth[key1][key2];
        }
      }
      for (const key1 of Object.keys(obj.reportAuth)) {
        const layer2Keys = Object.keys(obj.reportAuth[key1]);
        newReportAuth[key1] = {};
        for (const key2 of layer2Keys) {
          newReportAuth[key1][key2] = Object.keys(reportAuth).includes(key1) ? (Object.keys(reportAuth[key1]).includes(key2) ? reportAuth[key1][key2] : obj.reportAuth[key1][key2]) : obj.reportAuth[key1][key2];
        }
      }
      obj.pageAuth = newPageAuth;
      obj.reportAuth = newReportAuth;
      await col.updateOne({ _id: origin._id }, obj);
    }
  }
};

module.exports = {
  checkUpdate,
};
