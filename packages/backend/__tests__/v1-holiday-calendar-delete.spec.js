/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-holiday-calendar-delete.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-07-25 02:43:08 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('刪除假日行事曆', () => {
  const METHOD = 'DELETE';
  const _ENDPOINT = '/main/app/api/v1/calendars/holiday';
  let agent;
  let headers;
  let id;

  const data = {
    companyId: new ObjectId(testCompanyData[0]._id),
    date: new Date('2022/07/01'),
    type: 2,
    note: '休假日',
    valid: true,
    __vn: 0,
  }
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

    const calendarCol = NativeDBClient.getCollection(modelCodes.CALENDAR);
    await calendarCol.insertOne(data);
    const res = await calendarCol.findOne({ valid: data.valid, companyId: data.companyId, date: data.date, type: data.type });
    id = res._id.toString();
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('資料規則驗證', () => {
    test('[400:21142] 該行事曆不存在', async (done) => {
      const _data = lodash.cloneDeep(data);
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/testId`, headers, _data);
      Base.verifyError(res, 21142, '行事曆不存在');
      done();
    });
    test('[400:21135] 國定假日不可新刪修', async (done) => {
      const col = NativeDBClient.getCollection(modelCodes.CALENDAR);
      const resHoliday = await col.findOne({ note: '元旦', type: 3 });

      const _data = lodash.cloneDeep(data);
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${resHoliday._id.toString()}`, headers, _data);
      Base.verifyError(res, 21135, '國定假日不可新刪修');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 刪除假日行事曆-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${id}`, headers, data);

      const calendarCol = NativeDBClient.getCollection(modelCodes.CALENDAR);
      const calendarRes = await calendarCol.findOne({ companyId: new ObjectId(testCompanyData[0]._id), date: new Date(data.date), type: data.type });

      expect(res.status).toBe(200);
      expect(calendarRes.valid).toBe(false);
      done();
    });
  });
});
