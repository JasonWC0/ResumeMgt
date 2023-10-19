/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-service-default-func-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-04-01 04:03:21 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');

describe('更新服務類型資料', () => {
  const _ENDPOINT = '/main/app/api/v1/serviceGroups';
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
  })

  describe('資料規則驗證', () => {
    let data = {};
    beforeAll(async (done) => {
      const col = NativeDBClient.getCollection(modelCodes.SERVICEGROUP);
      data = await col.findOne({ code: 'HC', valid: true });
      done();
    });

    test('[400:90010] 資料版號有誤(低於現有版本)', async (done) => {
      const id = data._id.toString();
      const { pageAuth } = data;
      pageAuth.homeServiceDashboard.index = false;
      data.reportAuth = { test: { index: true } };
      const res = await agent
        .patch(`${_ENDPOINT}/${id}`)
        .send(data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: -1,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 90010,
        message: 'Data vn fail',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    let data = {};
    beforeAll(async (done) => {
      const col = NativeDBClient.getCollection(modelCodes.SERVICEGROUP);
      data = await col.findOne({ code: 'HC', valid: true });
      done();
    });
    test('[200] 更新服務類型資料-成功', async (done) => {
      const id = data._id.toString();
      const { pageAuth } = data;
      pageAuth.homeServiceDashboard.index = false;
      data.reportAuth = { test: { index: true } };
      const res = await agent
        .patch(`${_ENDPOINT}/${id}`)
        .send(data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: data.__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      const col = NativeDBClient.getCollection(modelCodes.SERVICEGROUP);
      const newData = await col.findOne({ code: 'HC', valid: true });
      expect(res.status).toBe(200);
      expect(newData.pageAuth.homeServiceDashboard.index).toBe(false);
      expect(newData.reportAuth.test.index).toBe(true);
      expect(newData.__cc).toBe(res.body.traceId);
      expect(newData.__vn).toBe(data.__vn+1);
      expect(newData.__sc).toBe('Erpv3');
      done();
    });
  });
})
