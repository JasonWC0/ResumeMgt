/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-case-close-account-list.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-12-04 10:10:49 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const request = require('supertest');
const { LunaServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const testCompanyData = require('./seeder/data/company.json').data;
const testCaseCloseAccountData = require('./seeder/data/case-close-account.json').data;

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
jest.mock('@erpv3/app-common/shared/connection-clients/default-luna-service-client');

describe('取得個案關帳列表', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/caseCloseAccounts';
  let agent;
  let headers;

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
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({ month: '11' })
        .set(headers);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10024,
        message: '年空白',
        result: null,
      });
      done();
    });
    test('[400:10025] 月空白.', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({ year: '2022' })
        .set(headers);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10025,
        message: '月空白',
        result: null,
      });
      done();
    });
    test('[400:20120] 服務分類資料有誤.', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({ year: '2022', month: '11' })
        .set(headers);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20120,
        message: '服務分類資料有誤',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    const { LunaServiceClass } = LunaServiceClient;
    test('[200] 取得個案關帳列表-成功', async (done) => {
      LunaServiceClass.setFromWebAPI.mockResolvedValue({
        success: true,
        data: [
          {
            "_id": "638761352bec39b2d0579c4e",
            "caseId": "000000626eb2351d2e140001",
            "month": "05",
            "year": "2022",
            "serviceCategory": "DC",
          }
        ]
      });

      const reqObj = {
        year: '2022',
        month: '05',
        serviceCategory: 'HC,DC'
      };

      const res = await agent
        .get(`${_ENDPOINT}`)
        .set(headers)
        .query(reqObj);
      
      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(2);
      expect(res.body.result.list).toHaveLength(2);
      expect(res.body.result.list[0].name).toBe('金貝貝');
      expect(res.body.result.list[0].serviceCategory).toBe(testCaseCloseAccountData[0].serviceCategory);
      expect(res.body.result.list[0].personalId).toBe(testCaseCloseAccountData[0].personalId);
      expect(res.body.result.list[0].area).toBe(testCaseCloseAccountData[0].area);
      expect(res.body.result.list[0].gender).toBe(testCaseCloseAccountData[0].gender);
      expect(res.body.result.list[0].status).toBe(testCaseCloseAccountData[0].status);
      done();
    });
  });
});
