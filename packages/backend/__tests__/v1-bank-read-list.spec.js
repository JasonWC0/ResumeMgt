/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-bank-read-list.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-07-27 02:03:06 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const NativeDBClient = require('./basic/native-db-client');
const modelCodes = require('./enums/model-codes');
const Base = require('./basic/basic');
const App = require('../app');

describe('取得銀行列表', () => {
  const _ENDPOINT = '/main/app/api/v1/banks';
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
    test('[200] 取得銀行列表-成功', async (done) => {
      const headers = {
        Authorization: `Bearer ${loginData.token}`,
        vn: '',
        sc: 'Erpv3',
        companyId: 'testCompanyId'
      }
      const res = await Base.callAPI(agent, 'GET', _ENDPOINT, headers);

      const col = NativeDBClient.getCollection(modelCodes.BANK);
      const result = await col.find({ valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(result.length);
      expect(res.body.result[0].code).toBeTruthy();
      expect(res.body.result[0].name).toBeTruthy();
      done();
    });
  });
});
