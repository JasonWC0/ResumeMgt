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
const _ = require('lodash');
const Base = require('./basic/basic');
const NativeDBClient = require('./basic/native-db-client');
const corpData = require('./seeder/data/corporation.json').data;
const modelCodes = require('./enums/model-codes');
const App = require('../app');

describe('更新企業資料', () => {
  let _ENDPOINT = '/main/app/api/v1/corporations';
  let agent;
  let loginData;

  const updateObj = {
    fullName: "仁寶電腦工業股份有限公司",
    shortName: "寶寶",
    code: "compal",
  }

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    _ENDPOINT = _ENDPOINT + `/${corpData[0]._id}`;

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
        .patch(`/main/app/api/v1/corporations/0000x0000x0000`)
        .send(updateObj)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: corpData[0].__vn,
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
    test('[400:90010] 資料版號有誤(低於現有版本)', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(updateObj)
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

  describe('需求欄位檢查', () => {
    test('[400:10005] 企業全名空白', async (done) => {
      const _data = _.cloneDeep(updateObj);
      _data.fullName = '';
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: corpData[0].__vn,
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
      const _data = _.cloneDeep(updateObj);
      _data.shortName = '';
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: corpData[0].__vn,
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
      const _data = _.cloneDeep(updateObj);
      _data.code = '';
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: corpData[0].__vn,
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
    test('[200] 更新企業資料-成功', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(updateObj)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: corpData[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      const corpCol = NativeDBClient.getCollection(modelCodes.CORPORATION);
      const uCorp = await corpCol.findOne({ _id: ObjectId(corpData[0]._id) });
      expect(uCorp.fullName).toBe(updateObj.fullName);
      expect(uCorp.__vn).toBe(corpData[0].__vn+1);
      expect(uCorp.__sc).toBe('Erpv3');
      expect(uCorp.__cc).toBe(res.body.traceId);
      done();
    });
  });
})
