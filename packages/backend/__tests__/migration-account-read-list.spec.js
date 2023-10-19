/**
 * FeaturePath: 經營管理-系統管理-帳號權限-檢視帳號
 * Accountable: JoyceS Hsu, Wilbert Yang
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-account-read-list.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-04-15 02:09:41 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const NativeDBClient = require('./basic/native-db-client');
const testAccountData = require('./seeder/data/account.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('讀取帳號列表', () => {
  const _ENDPOINT = '/main/migration/api/accounts';
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
    done();
  });

  describe('成功', () => {
    test('[200] 讀取帳號列表-成功', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(7);
      done();
    });
  });
});
