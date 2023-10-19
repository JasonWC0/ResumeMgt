/**
 * FeaturePath: 經營管理-系統管理-機構服務設定-假日行事曆
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: calendar-holiday-seeder.js
 * Project: @erpv3/backend
 * File Created: 2022-07-27 05:52:35 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const moment = require('moment');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { modelCodes } = require('@erpv3/app-core/domain/index');
const initData = require('./data/calendar-holiday.json');

const checkUpdate = async () => {
  const versionCol = DefaultDBClient.getCollection(modelCodes.VERSION);
  const versionQuery = { colName: `${modelCodes.CALENDAR}s` };
  const res = await versionCol.findOne(versionQuery).lean();
  if (!res || initData.version > res.version) {
    const newVersion = {
      $set: {
        version: initData.version,
      },
    };

    const col = DefaultDBClient.getCollection(modelCodes.CALENDAR);
    const objs = initData.data;
    objs.forEach((obj) => {
      obj.date = moment(obj.date, 'YYYY/MM/DD').toDate();
    });
    await col.deleteMany({});
    await col.insertMany(objs);
    await versionCol.updateOne(versionQuery, newVersion, { upsert: true });
  }
};

module.exports = {
  checkUpdate,
};
