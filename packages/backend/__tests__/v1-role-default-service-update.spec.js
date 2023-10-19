/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-role-default-service-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-04-12 03:42:48 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const roleDefaultServiceData = require('./seeder/data/role-default-service.json').data;

describe('更新系統預設服務類型的角色權限', () => {
  const _ENDPOINT = '/main/app/api/v1/roleDefaultServices';
  let agent;
  let loginData;
  let id = '';

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
    const serviceGroupId = serviceGroupRes._id;
    roleDefaultServiceData[0].serviceGroupId = serviceGroupId;
    roleDefaultServiceData[1].serviceGroupId = serviceGroupId;

    const roleDefaultServiceCol = NativeDBClient.getCollection(modelCodes.ROLEDEFAULTSERVICE);
    await roleDefaultServiceCol.insertMany(roleDefaultServiceData);
    const roleDefaultServiceRes = await roleDefaultServiceCol.findOne({ serviceGroupId: serviceGroupRes._id, role: roleDefaultServiceData[0].role });
    id = roleDefaultServiceRes._id;
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('資料規則驗證', () => {
    test('[404] 系統預設服務類型的角色權限Id不存在', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/oooxxxoooxxxoooxxx`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: roleDefaultServiceData[0].__vn,
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
      const data = lodash.cloneDeep(roleDefaultServiceData[0]);
      data.pageAuth.homeServiceDashboard.index = false;
      data.reportAuth = { test: { index: true } };

      const res = await agent
        .patch(`${_ENDPOINT}/${id.toString()}`)
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
    test('[200] 更新系統預設服務類型的角色權限-成功', async (done) => {
      const data = lodash.cloneDeep(roleDefaultServiceData[0]);
      data.pageAuth.homeServiceDashboard.index = false;
      data.reportAuth = { test: { index: true } };

      const res = await agent
        .patch(`${_ENDPOINT}/${id.toString()}`)
        .send(data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: roleDefaultServiceData[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      const roleDefaultServiceCol = NativeDBClient.getCollection(modelCodes.ROLEDEFAULTSERVICE);
      const roleDefaultServiceRes = await roleDefaultServiceCol.findOne({ _id: id });
      expect(res.status).toBe(200);
      expect(roleDefaultServiceRes.pageAuth).toEqual(data.pageAuth);
      expect(roleDefaultServiceRes.reportAuth).toEqual(data.reportAuth);
      expect(roleDefaultServiceRes.__cc).toBe(res.body.traceId);
      expect(roleDefaultServiceRes.__vn).toBe(roleDefaultServiceData[0].__vn+1);
      expect(roleDefaultServiceRes.__sc).toBe('Erpv3');
      done();
    });
  });
})
