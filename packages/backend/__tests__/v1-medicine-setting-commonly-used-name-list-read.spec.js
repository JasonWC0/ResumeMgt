/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-medicine-setting-commonly-used-name-list-read.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-08-08 04:49:15 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('取得用藥常用名稱', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/medicineSettings/commonlyUsedName';
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

    data = [{
      companyId: new ObjectId(testCompanyData[0]._id),
      type: 'hospital',
      name: ['台大', '長庚'],
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    },{
      companyId: new ObjectId(testCompanyData[0]._id),
      type: 'doctor',
      name: ['王醫生', '張醫生'],
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    }];
    const medicineUsedTimeCol = NativeDBClient.getCollection(modelCodes.COMMONLYUSEDNAME);
    await medicineUsedTimeCol.insertMany(data);
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
    test('[200] 取得用藥常用名稱-成功 (有type)', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { companyId: testCompanyData[0]._id.toString(), type: 'hospital' });

      expect(res.status).toBe(200);
      expect(res.body.result[0].type).toBe(data[0].type);
      expect(res.body.result[0].name).toEqual(data[0].name);
      done();
    });
    test('[200] 取得用藥常用名稱-成功 (無type)', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { companyId: testCompanyData[0]._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(2);
      done();
    });
  });
});
