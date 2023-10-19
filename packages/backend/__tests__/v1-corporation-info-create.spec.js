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
const NativeDBClient = require('./basic/native-db-client');
const _ = require('lodash');
const Base = require('./basic/basic');
const App = require('../app');
const modelCodes = require('./enums/model-codes');

describe('建立企業', () => {
  const _ENDPOINT = '/main/app/api/v1/corporations';
  let agent;
  let loginData;
  const createObj = {
    fullName: "測試仁寶電腦",
    shortName: "測試寶寶",
    code: "testcompalcode",
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
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位檢查', () => {
    test('[400:10005] 企業全名空白', async (done) => {
      const _data = _.cloneDeep(createObj);
      delete _data.fullName;
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10005,
        message: '總公司名稱空白',
        result: null,
      });
      done();
    });
    test('[400:10006] 企業短稱(內部使用)空白', async (done) => {
      const _data = _.cloneDeep(createObj);
      delete _data.shortName;
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10006,
        message: '總公司內部使用名稱空白',
        result: null,
      });
      done();
    });
    test('[400:10007] 企業代碼空白', async (done) => {
      const _data = _.cloneDeep(createObj);
      delete _data.code;
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10007,
        message: '總公司代碼空白',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[200] 建立企業-成功', async (done) => {
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(createObj)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      expect(res.body.result.corpId).toBeTruthy();
      const corpCol = NativeDBClient.getCollection(modelCodes.CORPORATION);
      const qCorp = await corpCol.findOne({ _id: ObjectId(res.body.result.corpId) });

      expect(qCorp.fullName).toBe(createObj.fullName);
      expect(qCorp.__sc).toBe('Erpv3');
      expect(qCorp.__vn).toBe(0);
      expect(qCorp.__cc).toBe(res.body.traceId);
      done();
    });
  });
})
