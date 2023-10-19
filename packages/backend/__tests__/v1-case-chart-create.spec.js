/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 */
const request = require('supertest');
const lodash = require('lodash');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const caseChartData = require('./seeder/data/case-chart.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('建立個案圖表', () => {
  const METHOD = 'POST';
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
      vn: '',
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
    test('[400:10010] 個案Id空白', async (done) => {
      const _data = lodash.cloneDeep(caseChartData.data[0]);
      _data.caseId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      Base.verifyError(res, 10010, '個案Id空白')
      done();
    });

    test('[400:11102] 公司ID空白', async (done) => {
      const _data = lodash.cloneDeep(caseChartData.data[0]);
      _data.companyId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      Base.verifyError(res, 11102, '公司ID空白')
      done();
    });

    test('[400:20323] 個案圖表分類值有誤', async (done) => {
      const _data = lodash.cloneDeep(caseChartData.data[0]);
      _data.category = -1;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      Base.verifyError(res, 20323, '個案圖表分類值有誤')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 建立個案圖表-成功', async (done) => {
      const _data = lodash.cloneDeep(caseChartData.data[0]);
      const caseChartCol = NativeDBClient.getCollection(modelCodes.CASECHART);
      const before = await caseChartCol.countDocuments({ valid: true });
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      const after = await caseChartCol.countDocuments({ valid: true });
      expect(res.status).toBe(200);
      expect(after).toBe(before + 1);
      done();
    });
  });
});
