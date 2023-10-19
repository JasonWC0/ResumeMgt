/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-service-item-read-list-gov.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-06-13 06:25:03 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const companyData = require('./seeder/data/company.json');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');

describe('取得政府服務項目列表', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/serviceItems/gov/list';
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
      vn: '',
      sc: 'Erpv3',
      companyId: companyData.data[0]._id,
    }
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('成功', () => {
    test('[200] 取得政府服務項目列表-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(222);
      done();
    });
    test('[200] 取得政府服務項目列表(query: version=2<10711的新制>)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, { version: 2 });

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(210);
      done();
    });
    test('[200] 取得政府服務項目列表(query: version=1<10701的制度>)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, { version: 1 });

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(173);
      done();
    });
  });
})
