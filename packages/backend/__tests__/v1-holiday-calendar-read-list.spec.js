/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-holiday-calendar-read-list.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-07-25 09:43:48 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const moment = require('moment');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('讀取假日行事曆列表', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/calendars/holiday';
  let agent;
  let headers;

  const query = {
    companyId: testCompanyData[0]._id,
    y: 2022,
  };
  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    const loginData = await Base.login(agent);
    headers = {
      Authorization: `Bearer ${loginData.token}`,
      vn: -1,
      sc: 'Erpv3',
      companyId: testCompanyData[0]._id,
    };

    const data = {
      companyId: new ObjectId(testCompanyData[0]._id),
      date: new Date('2022/07/01'),
      type: 2,
      note: '休假日',
      valid: true,
      __vn: 0,
    }
    const calendarCol = NativeDBClient.getCollection(modelCodes.CALENDAR);
    await calendarCol.insertOne(data);
    await calendarCol.findOne({ valid: data.valid, companyId: data.companyId, date: data.date, type: data.type });
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:11102] 公司ID空白', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.companyId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, _query);
      Base.verifyError(res, 11102, '公司ID空白');
      done();
    });
    test('[400:10024] 年空白', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.y = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, _query);
      Base.verifyError(res, 10024, '年空白');
      done();
    });
    test('[400:20017] 年不符合規則', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.y = 78;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, _query);
      Base.verifyError(res, 20017, '年不符合規則');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 讀取假日行事曆-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, query);

      const calendarCol = NativeDBClient.getCollection(modelCodes.CALENDAR);
      const calendarRes = await calendarCol.find({
        valid: true,
        $or: [
          { companyId: { $exists: false } },
          { companyId: { $in: [ObjectId(query.companyId), null, ''] } }
        ],
        date: {
          $gte: moment().set('year', query.y).startOf('y').toDate(),
          $lt: moment().set('year', query.y).endOf('y').toDate()
        }
      }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(calendarRes.length);
      done();
    });
  });
});
