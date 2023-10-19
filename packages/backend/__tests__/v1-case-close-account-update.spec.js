/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-case-close-account-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-12-04 10:10:49 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const { LunaServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const testCompanyData = require('./seeder/data/company.json').data;

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
jest.mock('@erpv3/app-common/shared/connection-clients/default-luna-service-client');

describe('更新個案關帳', () => {
  const METHOD = 'POST'
  const _ENDPOINT = '/main/app/api/v1/caseCloseAccounts/multi';
  let agent;
  let headers;
  const data = {
    year: '2022',
    month: '05',
    cases: [
      {
        caseId: '000000626eb2351d2e140000',
        serviceType: 'hc'
      }
    ],
    status: 1
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
      vn: 0,
      sc: 'Erpv3',
      companyId: testCompanyData[0]._id
    }
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:10024] 年空白.', async (done) => {
      const _data = lodash.cloneDeep(data);
      delete _data.year;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10024, '年空白');
      done();
    });
    test('[400:20017] 年不符合規則.', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.year = '111';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20017, '年不符合規則');
      done();
    });
    test('[400:10025] 月空白.', async (done) => {
      const _data = lodash.cloneDeep(data);
      delete _data.month;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10025, '月空白');
      done();
    });
    test('[400:20018] 月不符合規則.', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.month = '0';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20018, '月不符合規則');
      done();
    });
    test('[400:10308] 個案關帳狀態空白.', async (done) => {
      const _data = lodash.cloneDeep(data);
      delete _data.status;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10308, '個案關帳狀態空白');
      done();
    });
    test('[400:10309] 個案關帳狀態有誤.', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.status = 99;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10309, '個案關帳狀態有誤');
      done();
    });
    test('[400:10310] 個案資訊空白.', async (done) => {
      const _data = lodash.cloneDeep(data);
      delete _data.cases;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10310, '個案資訊空白');
      done();
    });
  });

  describe('成功', () => {
    const { LunaServiceClass } = LunaServiceClient;
    test('[200] 更新個案關帳-成功', async (done) => {
      LunaServiceClass.setFromWebAPI.mockResolvedValue({
        success: true,
        data: {}
      });
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, data);
      expect(res.status).toBe(200);
      done();
    });
  });
});
