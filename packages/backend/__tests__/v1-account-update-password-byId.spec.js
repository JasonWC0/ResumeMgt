/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-account-update-password.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-04-15 02:10:49 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const conf = require('@erpv3/app-common/shared/config');
const { KeyCloakClient } = require('@erpv3/app-common/shared/connection-clients');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testAccountData = require('./seeder/data/account.json').data;
const Base = require('./basic/basic');
const App = require('../app');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');

describe('update account pwd', () => {
  const METHOD = 'PATCH';
  const _ENDPOINT = '/main/app/api/v1/accounts';
  let agent;
  let headers;
  let accountId;
  const data = {
    oldPassword: 'oldPassword',
    newPassword: 'newPassword'
  };

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    loginData = await Base.login(agent);
    headers = {};
    headers[conf.REGISTER.KEY] = `Basic ${conf.REGISTER.CLIENTS[1].CLIENT_SECRET}`;

    const accountCol = NativeDBClient.getCollection(modelCodes.ACCOUNT);
    const accountRes = await accountCol.findOne({ account: testAccountData[0].account });
    accountId = accountRes._id.toString();
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
    done();
  });

  describe('Required fields', () => {
    test('[400:10016] 舊密碼空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.oldPassword = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${accountId}/changePasswordById`, headers, _data)
      Base.verifyError(res, 10016, '舊密碼空白')
      done();
    });
    test('[400:10017] 新密碼空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.newPassword = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${accountId}/changePasswordById`, headers, _data)
      Base.verifyError(res, 10017, '新密碼空白')
      done();
    });
  });
  
  describe('Validation rules', () => {
    test('[400:20007] 帳號不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/xxxxxxxxxxxxxxx/changePasswordById`, headers, data)
      Base.verifyError(res, 20007, '帳號不存在')
      done();
    });
    test('[400:20006] 舊密碼有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.oldPassword = 'wrong';
      KeyCloakClient.userLogin.mockResolvedValue();
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${accountId}/changePasswordById`, headers, _data)
      Base.verifyError(res, 20006, '舊密碼有誤')
      done();
    });
  });

  describe('Success', () => {
    test('[success]', async (done) => {
      KeyCloakClient.userLogin.mockResolvedValue({});
      KeyCloakClient.adminLogin.mockResolvedValue({ access_token: '' });
      KeyCloakClient.updateUserPassword();
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${accountId}/changePasswordById`, headers, data)
      expect(res.status).toBe(200);
      done();
    });
  });
});
