/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-medicine-setting-used-time-get.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-08-08 04:51:26 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('取得用藥時間', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/medicineSettings/medicineUsedTime';
  let agent;
  let headers;
  let data;

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
      vn: 0,
      sc: 'Erpv3',
      companyId: testCompanyData[0]._id
    }

    data = {
      companyId: new ObjectId(testCompanyData[0]._id),
      beforeBreakfast: '08:30',
      afterBreakfast: '',
      beforeLunch: '11:45',
      afterLunch: '13:30',
      beforeDinner: '',
      afterDinner: '',
      beforeBedtime: '',
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    }
    const medicineUsedTimeCol = NativeDBClient.getCollection(modelCodes.MEDICINEUSEDTIME);
    await medicineUsedTimeCol.insertOne(data);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:11102] 公司ID空白', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { companyId: '' });
      Base.verifyError(res, 11102, '公司ID空白');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 取得用藥時間-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { companyId: testCompanyData[0]._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.result.beforeBreakfast).toBe(data.beforeBreakfast);
      expect(res.body.result.afterBreakfast).toBe('07:45');
      expect(res.body.result.beforeLunch).toBe(data.beforeLunch);
      expect(res.body.result.afterLunch).toBe(data.afterLunch);
      expect(res.body.result.beforeDinner).toBe('16:45');
      expect(res.body.result.afterDinner).toBe('18:15');
      expect(res.body.result.beforeBedtime).toBe('21:00');
      done();
    });
  });
});