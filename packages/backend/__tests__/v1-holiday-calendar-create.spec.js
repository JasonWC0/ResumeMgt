/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-holiday-calendar-create.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-07-25 02:42:07 pm
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

describe('新增假日行事曆', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/calendars/holiday';
  let agent;
  let headers;

  const data = {
    companyId: testCompanyData[0]._id,
    date: '2022/07/01',
    type: 2,
    note: '休假日'
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

    const calendarCol = NativeDBClient.getCollection(modelCodes.CALENDAR);
    await calendarCol.insertOne({
      companyId: new ObjectId(testCompanyData[0]._id),
      date: new Date('2022/07/02'),
      type: 2,
      note: '休假日',
      valid: true,
      __vn: 0,
    });
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位檢查', () => {
    test('[400:11102] 公司ID空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.companyId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11102, '公司ID空白');
      done();
    });
    test('[400:11125] 日曆日期空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.date = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11125, '日曆日期空白');
      done();
    });
    test('[400:21134] 日曆日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.date = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21134, '日曆日期格式有誤');
      done();
    });
    test('[400:21135] 國定假日不可新刪修 (國定假日type=3)', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.type = 3;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21135, '國定假日不可新刪修');
      done();
    });
    test('[400:21136] 假日類別分類有誤 (type=0~2)', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.type = 9999;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21136, '假日類別分類有誤');
      done();
    });
    test('[400:21138] 日曆主類別不存在 (假日為holiday)', async (done) => {
      const _data = lodash.cloneDeep(data);
      const res = await Base.callAPI(agent, METHOD, '/main/app/api/v1/calendars/test', headers, _data);
      Base.verifyError(res, 21138, '日曆主類別不存在');
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21121] 公司不存在', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.companyId = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21121, '公司不存在');
      done();
    });
    test('[400:21141] 該日已有假日行事曆(非國定假日)', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.date = '2022/07/02';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21141, '該日已有假日行事曆(非國定假日)');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 新增假日行事曆-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);

      const calendarCol = NativeDBClient.getCollection(modelCodes.CALENDAR);
      const calendarRes = await calendarCol.findOne({ companyId: new ObjectId(data.companyId), date: new Date(data.date), valid: true });

      expect(res.status).toBe(200);
      expect(calendarRes.type).toBe(data.type);
      expect(calendarRes.note).toBe(data.note);
      done();
    });
  });
});