/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-role-authorization-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-04-19 11:39:12 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('更新公司角色權限', () => {
  const _ENDPOINT = '/main/app/api/v1/roleAuthorizations';
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

  describe('資料規則驗證', () => {
    let id = '';
    let data = {};
    beforeAll(async (done) => {
      const col = NativeDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
      data = {
        companyId: ObjectId(testCompanyData[0]._id),
        role: 1,
        name: '管理者',
        manageAuthLevel: 0,
        isDefault: true,
        pageAuth: {
          test: {
            index: 0
          },
        },
        reportAuth: {
          test: {
            index: 1,
          },
        },
        valid: true,
        __vn: 0,
        __cc: '',
        __sc: '',
      }
      await col.insertOne(data);
      const obj = await col.findOne({ companyId: data.companyId, role: data.role });
      id = obj._id.toString();
      done();
    });

    test('[404] 公司角色Id不存在', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/oooxxxoooxxxoooxxx`)
        .send({ pageAuth: {}, reportAuth: {} })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
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
      const _data = {
        pageAuth: {
          test: {
            index: 1,
          },
          newOne: {
            index: 0,
          }
        },
        reportAuth: {
          newReport: {
            test: 1,
          }
        }
      }
      const res = await agent
        .patch(`${_ENDPOINT}/${id}`)
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
    let id = '';
    let data = {};
    beforeAll(async (done) => {
      const col = NativeDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
      data = {
        companyId: ObjectId(testCompanyData[0]._id),
        role: 0,
        name: '管理者',
        manageAuthLevel: 0,
        isDefault: true,
        pageAuth: {
          test: {
            index: 0
          },
        },
        reportAuth: {
          test: {
            index: 1,
          },
        },
        valid: true,
        __vn: 0,
        __cc: '',
        __sc: '',
      }
      await col.insertOne(data);
      const obj = await col.findOne({ companyId: data.companyId, role: data.role });
      id = obj._id.toString();
      done();
    });

    test('[200] 更新公司角色權限-成功', async (done) => {
      const _data = {
        pageAuth: {
          test: {
            index: 1,
          },
          newOne: {
            index: 0,
          }
        },
        reportAuth: {
          newReport: {
            test: 1,
          }
        }
      }
      const res = await agent
        .patch(`${_ENDPOINT}/${id}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: data.__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      const col = NativeDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
      const obj = await col.findOne({ companyId: data.companyId, role: data.role });
      expect(res.status).toBe(200);
      expect(obj.pageAuth).toEqual(_data.pageAuth);
      expect(obj.reportAuth).toEqual(_data.reportAuth);
      expect(obj.__vn).toBe(data.__vn+1);
      expect(obj.__cc).toBe(res.body.traceId);
      expect(obj.__sc).toBe('Erpv3');
      done();
    });
  });
});
