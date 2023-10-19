/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-company-service-group-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-04-13 04:55:30 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('更新公司服務類型', () => {
  const _ENDPOINT = '/main/app/api/v1/companies';
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
    test('[400:11116] 服務類型Id空白', async (done) => {
      const data = {
        id: '',
      };

      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/serviceGroup`)
        .send(data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
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
  });

  describe('資料規則驗證', () => {
    test('[400:90010] 資料版號有誤(低於現有版本)', async (done) => {
      const _data = {
        id: 'testServiceGroupId',
      };
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/serviceGroup`)
        .send(_data)
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
      const roleDefaultCol = NativeDBClient.getCollection(modelCodes.ROLEDEFAULTSERVICE);
      await roleDefaultCol.insertMany([{
        serviceGroupId: data._id,
        role: 0,
        name: '管理員',
        manageAuthLevel: 0,
        pageAuth: { test: { index: 1 } },
        reportAuth: { test: { index: 1 }},
        valid: true,
        __cc: '',
        __vn: 0,
        __sc: '',
      },{
        serviceGroupId: data._id,
        role: 1,
        name: '經營者',
        manageAuthLevel: 0,
        pageAuth: { test: { index: 1 } },
        reportAuth: { test: { index: 1 }},
        valid: true,
        __cc: '',
        __vn: 0,
        __sc: '',
      },{
        serviceGroupId: data._id,
        role: 2,
        name: '督導',
        manageAuthLevel: 1,
        pageAuth: { test: { index: 1 } },
        reportAuth: { test: { index: 1 }},
        valid: true,
        __cc: '',
        __vn: 0,
        __sc: '',
      },{
        serviceGroupId: data._id,
        role: 3,
        name: '專員',
        manageAuthLevel: 2,
        pageAuth: { test: { index: 0 } },
        reportAuth: { test: { index: 0 }},
        valid: true,
        __cc: '',
        __vn: 0,
        __sc: '',
      }]);
      done();
    });

    test('[200] 更新公司服務類型-成功', async (done) => {
      const _data = {
        id: data._id.toString(),
      };
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/serviceGroup`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      const companyCol = NativeDBClient.getCollection(modelCodes.COMPANY);
      const companyData = await companyCol.findOne({ _id: ObjectId(testCompanyData.data[0]._id) });
      const roleCol = NativeDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
      const roleData = await roleCol.find({ companyId: ObjectId(testCompanyData.data[0]._id) }).toArray();

      expect(res.status).toBe(200);
      expect(companyData.serviceGroupId.toString()).toBe(data._id.toString());
      expect(companyData.__vn).toBe(testCompanyData.data[0].__vn+1);
      expect(roleData.length).toBe(4);
      done();
    });
  });
});
