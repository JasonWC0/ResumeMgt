/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-account-update-info.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-12 02:50:49 pm
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

describe('更新帳號資料', () => {
  const METHOD = 'PATCH';
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
      sc: 'Migration',
      companyId: 'testCompanyId'
    };

    // create another corporation
    const createObj = {
      _id: ObjectId('627cb0ad0d05af99d56c0ac8'),
      fullName: "測試仁寶電腦",
      shortName: "測試寶寶",
      code: "testcompalcode",
      __enc: {
        "provider": "./packages/backend/configs/encryption.keys.json",
        "keyId": "compal",
        "method": "AES/CBC/PKCS7"
      },
      __cc: "",
      __vn: 0,
      __sc: ""
    }
    const col = NativeDBClient.getCollection(modelCodes.CORPORATION);
    await col.insertOne(createObj);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:20004] 帳號類型資料有誤 0:員工 1:顧客', async (done) => {
      const _data = { type: 10000 };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testAccountData[1].account}`, headers, _data);
      Base.verifyError(res, 20004, '帳號類型有誤');
      done();
    });
    test('[400:20015] 帳號不符合規則，特殊符號只允許@、.及_', async (done) => {
      const _data = { newAccount: 'test===' };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testAccountData[1].account}`, headers, _data);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(20015);
      expect(res.body.message).toBe('帳號不符合規則');
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:20007] 帳號不存在', async (done) => {
      const _data = { corpId: 'wrong' };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/ooooxxxxooooxxxx`, headers, _data);
      Base.verifyError(res, 20007, '帳號不存在');
      done();
    });
    test('[400:20002] 新帳號已存在', async (done) => {
      const _data = { newAccount: testAccountData[2].account };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testAccountData[1].account}`, headers, _data);
      Base.verifyError(res, 20002, '登入帳號已存在');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 更新帳號資料(企業Id)-成功', async (done) => {
      const _data = { corpId: '627cb0ad0d05af99d56c0ac8' };
      headers.vn = testAccountData[1].__vn;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testAccountData[1].account}`, headers, _data);

      const col = NativeDBClient.getCollection(modelCodes.ACCOUNT);
      const accountRes = await col.findOne({ account: testAccountData[1].account.toLowerCase() });

      expect(res.status).toBe(200);
      expect(accountRes.corpId.toString()).toBe('627cb0ad0d05af99d56c0ac8');
      expect(accountRes.__vn).toBe(testAccountData[1].__vn+1);
      expect(accountRes.__sc).toBe('Migration');
      expect(accountRes.__cc).toBe(res.body.traceId);
      done();
    });
    test('[200] 更新帳號資料(新account)-成功', async (done) => {
      const _data = { newAccount: 'newAccountTest' };
      headers.vn = testAccountData[2].__vn;

      KeyCloakClient.adminLogin.mockResolvedValue({ access_token: '' });
      KeyCloakClient.updateUser.mockResolvedValue(true);
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testAccountData[2].account}`, headers, _data);

      const col = NativeDBClient.getCollection(modelCodes.ACCOUNT);
      const accountRes = await col.findOne({ account: 'newAccountTest'.toLowerCase() });
      const accountOldRes = await col.findOne({ account: testAccountData[2].account.toLowerCase() });

      expect(res.status).toBe(200);
      expect(accountRes.account).toBe('newaccounttest');
      expect(accountOldRes).toBe(null);
      expect(accountRes.__vn).toBe(testAccountData[2].__vn+1);
      expect(accountRes.__sc).toBe('Migration');
      expect(accountRes.__cc).toBe(res.body.traceId);
      done();
    });
    test('[200] 更新帳號資料(類型type)-成功', async (done) => {
      const _data = { type: 1 };
      headers.vn = testAccountData[3].__vn;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testAccountData[3].account}`, headers, _data);

      const col = NativeDBClient.getCollection(modelCodes.ACCOUNT);
      const accountRes = await col.findOne({ account: testAccountData[3].account.toLowerCase() });

      expect(res.status).toBe(200);
      expect(accountRes.type).toBe(1);
      expect(accountRes.__vn).toBe(testAccountData[3].__vn+1);
      expect(accountRes.__sc).toBe('Migration');
      expect(accountRes.__cc).toBe(res.body.traceId);
      done();
    });
  });
});
