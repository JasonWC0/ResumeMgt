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

describe('更新個案圖表', () => {
  const METHOD = 'PATCH';
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

  describe('成功', () => {
    test('[200] 更新個案圖表-成功', async (done) => {
      const _data = lodash.cloneDeep(caseChartData.data[0]);
      _data.isTemp = false;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_data._id}`, headers, _data);

      const caseChartCol = NativeDBClient.getCollection(modelCodes.CASECHART);
      const doc = await caseChartCol.findOne({ _id: ObjectId(_data._id), valid: true });
      expect(res.status).toBe(200);
      expect(doc.isTemp).toBeFalsy();
      done();
    });
  });
});
