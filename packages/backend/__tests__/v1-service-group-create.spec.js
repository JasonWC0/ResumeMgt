/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-service-group-create.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-07-05 05:48:33 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');

describe('新增服務類型資料', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/serviceGroups';
  let agent;
  let headers;

  const data = {
    code: 'testServiceGroup',
    name: 'viewTitle',
    pageAuth: {
      page1: {
        index: true,
      }
    },
    reportAuth: {
      report1: true,
    },
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
      companyId: 'testCompanyId'
    };

    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位檢查', () => {
    test('[400:10022] 服務類型組別空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.code = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 10022, '服務類型組別空白');
      done();
    });
    test('[400:10023] 服務類型顯示文字空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.name = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 10023, '服務類型顯示文字空白');
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:20014] 服務類型組別已存在', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.code = 'ALL';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 20014, '服務類型組別已存在');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 新增服務類型資料-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);

      const col = NativeDBClient.getCollection(modelCodes.SERVICEGROUP);
      const serviceGroupRes = await col.findOne({ code: data.code });

      expect(res.status).toBe(200);
      expect(serviceGroupRes.code).toBe(data.code);
      expect(serviceGroupRes.name).toBe(data.name);
      expect(serviceGroupRes.pageAuth).toEqual(data.pageAuth);
      expect(serviceGroupRes.reportAuth).toEqual(data.reportAuth);
      expect(serviceGroupRes.__vn).toBe(0);
      done();
    });
  });
});