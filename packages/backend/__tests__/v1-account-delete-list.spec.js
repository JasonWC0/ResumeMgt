/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-account-delete-list.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-12 02:34:30 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const { KeyCloakClient } = require('@erpv3/app-common/shared/connection-clients');
const NativeDBClient = require('./basic/native-db-client');
const testAccountData = require('./seeder/data/account.json').data;
const modelCodes = require('./enums/model-codes');
const Base = require('./basic/basic');
const App = require('../app');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');

describe('刪除帳號列表', () => {
  const _ENDPOINT = '/main/app/api/v1/accounts';
  let agent;
  let loginData;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    loginData = await Base.login(agent);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:10000] 企業Id空白', async (done) => {
      const res = await agent
        .delete(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Migration',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10000,
        message: '總公司ID空白',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[200] 刪除帳號列表-成功', async (done) => {
      KeyCloakClient.adminLogin.mockResolvedValue({ access_token: '' });
      KeyCloakClient.deleteUser.mockResolvedValue(true);
      const res = await agent
        .delete(`${_ENDPOINT}`)
        .query({ corpId: `${testAccountData[0].corpId}`})
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Migration',
          companyId: 'testCompanyId'
        });

      const col = NativeDBClient.getCollection(modelCodes.ACCOUNT);
      const accountRes = await col.find({ corpId: ObjectId(testAccountData[0].corpId) }).toArray();

      expect(res.status).toBe(200);
      expect(accountRes.length).toBe(0);
      done();
    });
  });
});