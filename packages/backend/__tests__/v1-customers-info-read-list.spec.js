/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-company-info-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-02-16 11:42:43 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const testData = require('./seeder/data/customer.json');

describe('讀取顧客列表', () => {
  let agent;
  let loginData;
  const personData = testData.person[0];
  let _ENDPOINT = `/main/app/api/v1/customers`;

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
  })

  describe('資料規則驗證', () => {
    test('[400:200106] 企業Id不存在', async (done) => {
      const res = await agent
        .get(_ENDPOINT)
        .query({corpId: 'abcdef012345abcdef012345'})
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20000,
        message: '總公司不存在',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[200] 讀取顧客列表-成功', async (done) => {
      const res = await agent
        .get(_ENDPOINT)
        .query({corpId: personData.corpId.toString()})
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(3);
      done();
    });
  });
})
