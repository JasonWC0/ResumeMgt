/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-read-company-info.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-02-14 11:37:57 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCorporationData = require('./seeder/data/corporation.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('刪除企業', () => {
  const _ENDPOINT = '/main/app/api/v1/corporations';
  let agent;
  let loginData;
  let oCorp;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    oCorp = testCorporationData.data[0];

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
    test('[404:90008] 企業Id不存在', async (done) => {
      const res = await agent
        .delete(`${_ENDPOINT}` + `/0000x0000x0000`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 90008,
        message: 'URI not found',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[200] 刪除企業-成功', async (done) => {
      const res = await agent
        .delete(`${_ENDPOINT}`+ `/${oCorp._id}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      const corpCol = NativeDBClient.getCollection(modelCodes.CORPORATION);
      const qCorp = await corpCol.findOne({ _id: ObjectId(oCorp._id) })
      expect(qCorp.valid).toBe(false);
      expect(qCorp.__vn).toBe(oCorp.__vn+1);
      expect(qCorp.__cc).toBe(res.body.traceId);
      expect(qCorp.__sc).toBe('Erpv3');
      done();
    });
  });
})
