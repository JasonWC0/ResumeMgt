/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-role-default-service-create.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-04-12 03:43:06 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const roleDefaultServiceData = require('./seeder/data/role-default-service.json').data;

describe('創建系統預設服務類型的角色權限', () => {
  const _ENDPOINT = '/main/app/api/v1/roleDefaultServices';
  let agent;
  let loginData;
  let serviceGroupId = '';

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    loginData = await Base.login(agent);

    const serviceGroupCol = NativeDBClient.getCollection(modelCodes.SERVICEGROUP);
    const serviceGroupRes = await serviceGroupCol.findOne({ code: 'ALL', valid: true });
    serviceGroupId = serviceGroupRes._id;
    roleDefaultServiceData[0].serviceGroupId = serviceGroupId;
    roleDefaultServiceData[1].serviceGroupId = serviceGroupId;
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位檢查', () => {
    test('[400:11116] 服務類型Id空白', async (done) => {
      const data = lodash.cloneDeep(roleDefaultServiceData[0]);
      data.serviceGroupId = '';

      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11116,
        message: '服務類型Id空白',
        result: null,
      });
      done();
    });
    test('[400:11117] 員工角色空白', async (done) => {
      const data = lodash.cloneDeep(roleDefaultServiceData[0]);
      data.role = '';

      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11117,
        message: '員工角色空白',
        result: null,
      });
      done();
    });
    test('[400:11118] 角色名稱空白', async (done) => {
      const data = lodash.cloneDeep(roleDefaultServiceData[0]);
      data.name = '';

      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11118,
        message: '角色名稱空白',
        result: null,
      });
      done();
    });
    test('[400:21123] 角色資料有誤', async (done) => {
      const data = lodash.cloneDeep(roleDefaultServiceData[0]);
      data.role = 1000;

      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21123,
        message: '角色資料有誤',
        result: null,
      });
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21122] 服務類型Id不存在', async (done) => {
      const data = lodash.cloneDeep(roleDefaultServiceData[0]);
      data.serviceGroupId = 'oooxxxoooxxxoooxxx';

      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21122,
        message: '服務類型Id不存在',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[200] 創建系統預設服務角色權限-成功', async (done) => {
      const data = lodash.cloneDeep(roleDefaultServiceData[0]);
      data.serviceGroupId = serviceGroupId;

      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      const roleDefaultServiceCol = NativeDBClient.getCollection(modelCodes.ROLEDEFAULTSERVICE);
      const roleDefaultServiceRes = await roleDefaultServiceCol.findOne({ serviceGroupId, role: data.role });
      expect(res.status).toBe(200);
      expect(roleDefaultServiceRes.name).toEqual(data.name);
      expect(roleDefaultServiceRes.manageAuthLevel).toEqual(0);
      expect(roleDefaultServiceRes.pageAuth).toEqual(data.pageAuth);
      expect(roleDefaultServiceRes.reportAuth).toEqual(undefined);
      expect(roleDefaultServiceRes.__vn).toEqual(0);
      expect(roleDefaultServiceRes.__cc).toEqual(res.body.traceId);
      expect(roleDefaultServiceRes.__sc).toEqual('Erpv3');
      done();
    });
  });
})
