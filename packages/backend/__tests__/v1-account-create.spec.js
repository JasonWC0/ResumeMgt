/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-account-create.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-04-08 05:14:22 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const { KeyCloakClient } = require('@erpv3/app-common/shared/connection-clients');
const NativeDBClient = require('./basic/native-db-client');
const testAccountData = require('./seeder/data/account.json').data;
const modelCodes = require('./enums/model-codes');
const Base = require('./basic/basic');
const App = require('../app');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');

describe('建立帳號', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/accounts';
  let agent;
  let loginData;
  let headers;

  const data = {
    corpId: testAccountData[1].corpId,
    personId: testAccountData[1].personId,
    type: 1,
    account: 'testAccount',
    pwd: '12345678',
  }

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
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:10000] 企業Id空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.corpId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(10000);
      expect(res.body.message).toBe('總公司ID空白');
      done();
    });
    test('[400:10101] 個人Id空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.personId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(10101);
      expect(res.body.message).toBe('個人ID空白');
      done();
    });
    test('[400:10015] 帳號類型空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.type = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(10015);
      expect(res.body.message).toBe('帳號類型空白');
      done();
    });
    test('[400:10011] 帳號空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.account = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(10011);
      expect(res.body.message).toBe('帳號空白');
      done();
    });
    test('[400:10012] 密碼空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.pwd = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(10012);
      expect(res.body.message).toBe('密碼空白');
      done();
    });
    test('[400:20004] 帳號類型有誤. 帳號類型(type)>> 0:員工, 1:顧客', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.type = 1000;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(20004);
      expect(res.body.message).toBe('帳號類型有誤');
      done();
    });
    test('[400:20005] 帳號機構Admin帳號型別有誤. 須為Boolean', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.companyAdmin = 1000;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(20005);
      expect(res.body.message).toBe('帳號機構Admin帳號型別有誤');
      done();
    });
    test('[400:20015] 帳號不符合規則，特殊符號只允許@、.及_', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.account = 'test===';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(20015);
      expect(res.body.message).toBe('帳號不符合規則');
      done();
    });
    test('[400:20015] 帳號不符合規則，長度需3-64', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.account = 'aa';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(20015);
      expect(res.body.message).toBe('帳號不符合規則');
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:20002] 帳號已存在', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.account = 'admin';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(20002);
      expect(res.body.message).toBe('登入帳號已存在');
      done();
    });
    test('[400:20003] 該人員(員工|顧客)於此公司已綁定帳號', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.type = 0;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(20003);
      expect(res.body.message).toBe('該登入者於此公司的人員類型(員工/顧客)已存有帳號');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 建立帳號-成功', async (done) => {
      KeyCloakClient.adminLogin.mockResolvedValue({ access_token: '' });
      KeyCloakClient.createUser.mockResolvedValue({});
      KeyCloakClient.readUserByUsername.mockResolvedValue([{ id:'keycloakId' }]);
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);

      const col = NativeDBClient.getCollection(modelCodes.ACCOUNT);
      const accountRes = await col.findOne({ account: data.account.toLowerCase() });
      expect(res.status).toBe(200);
      expect(res.body.result.id).toBe(accountRes._id.toString());
      expect(accountRes.corpId.toString()).toBe(data.corpId);
      expect(accountRes.personId.toString()).toBe(data.personId);
      expect(accountRes.type).toBe(data.type);
      expect(accountRes.__vn).toBe(0);
      done();
    });
  });
});
