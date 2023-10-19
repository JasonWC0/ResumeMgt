/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-account-delete.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-06-22 02:01:23 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const { KeyCloakClient } = require('@erpv3/app-common/shared/connection-clients');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testAccountData = require('./seeder/data/account.json').data;
const modelCodes = require('./enums/model-codes');
const Base = require('./basic/basic');
const App = require('../app');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');

describe('刪除帳號', () => {
  const METHOD = 'DELETE';
  const _ENDPOINT = '/main/app/api/v1/accounts';
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
      vn: 0,
      sc: 'Erpv3',
      companyId: testCompanyData[0]._id
    }
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
    done();
  });

  describe('資料規則驗證', () => {
    test('[400:20007] 帳號不存在', async (done) => {
      KeyCloakClient.adminLogin.mockResolvedValue({ access_token: '' });
      KeyCloakClient.deleteUser.mockResolvedValue(true);
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/testnonono`, headers);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20007,
        message: '帳號不存在',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[200] 刪除帳號-成功', async (done) => {
      KeyCloakClient.adminLogin.mockResolvedValue({ access_token: '' });
      KeyCloakClient.deleteUser.mockResolvedValue(true);
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testAccountData[0].account}`, headers);

      const col = NativeDBClient.getCollection(modelCodes.ACCOUNT);
      const accountRes = await col.findOne({ corpId: ObjectId(testAccountData[0].corpId), personId: ObjectId(testAccountData[0].personId) });

      expect(res.status).toBe(200);
      expect(accountRes.valid).toEqual(false);
      expect(accountRes.__vn).toBe(1);
      done();
    });
  });
});
