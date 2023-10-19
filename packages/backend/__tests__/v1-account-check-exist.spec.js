/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-account-check-exist.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-12 04:39:51 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const NativeDBClient = require('./basic/native-db-client');
const testAccountData = require('./seeder/data/account.json').data;
const modelCodes = require('./enums/model-codes');
const Base = require('./basic/basic');
const App = require('../app');

describe('確認帳號是否存在', () => {
  const _ENDPOINT = '/main/app/api/v1/accounts/checkExist';
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

  describe('需求欄位檢查', () => {
    test('[400:10011] 企業Id空白', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Migration',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10011,
        message: '帳號空白',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[200] 使用帳號查詢是否存在-成功', async (done) => {
      const res = await agent
      .get(`${_ENDPOINT}`)
      .query({ account: `${testAccountData[1].account}` })
      .set({
        Authorization: `Bearer ${loginData.token}`,
        vn: testAccountData[1].__vn,
        sc: 'Migration',
        companyId: 'testCompanyId'
      });

      const col = NativeDBClient.getCollection(modelCodes.ACCOUNT);
      const accountRes = await col.findOne({ account: testAccountData[1].account });

      expect(res.status).toBe(200);
      expect(res.body.result.exist).toBe(!!accountRes);
      expect(res.body.result.accountData.vn).toBe(testAccountData[1].__vn)
      done();
    });

    test('[200] 使用Id查詢是否存在 - 成功', async (done) => {
      const col = NativeDBClient.getCollection(modelCodes.ACCOUNT);
      const accountRes = await col.findOne({ account: testAccountData[1].account });

      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({ id: `${accountRes._id.toString()}` })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      expect(res.body.result.accountData.personId).toBe(testAccountData[1].personId);
      expect(res.body.result.accountData.corpId).toBe(testAccountData[1].corpId);
      expect(res.body.result.accountData.vn).toBe(testAccountData[1].__vn)
      done();
    });
  });
});