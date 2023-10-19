/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 */
const ObjectId = require('mongodb').ObjectId;
const request = require('supertest');
const lodash = require('lodash');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const caseChartData = require('./seeder/data/case-chart.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('刪除個案圖表', () => {
  const METHOD = 'DELETE';
  const _ENDPOINT = '/main/app/api/v1/caseCharts';
  let agent;
  let loginData;
  let headers;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    loginData = await Base.login(agent);
    headers = {
      Authorization: `Bearer ${loginData.token}`,
      vn: '0',
      sc: 'Erpv3',
      companyId: 'testCompanyId'
    }
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[404:10010] 個案Id空白', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/fakeId`, headers);
      expect(res.status).toBe(404);
      done();
    });
  })

  describe('資料規則驗證', () => {
    test('[400:20324] 個案圖表已被其他個案圖表參考', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseChartData.data[0]._id}`, headers);
      Base.verifyError(res, 20324, '個案圖表已被其他圖表參考');
      done();
    });
  })

  describe('成功', () => {
    test('[200] 刪除個案圖表-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseChartData.data[1]._id}`, headers);

      const caseChartCol = NativeDBClient.getCollection(modelCodes.CASECHART);
      const doc = await caseChartCol.findOne({ _id: ObjectId(caseChartData.data[1]._id), valid: true });
      expect(res.status).toBe(200);
      expect(doc).toBeFalsy();
      done();
    });
  });
});
