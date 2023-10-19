/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-role-authorization-delete.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-04-19 11:39:41 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const fsExtra = require('fs-extra');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCorpData = require('./seeder/data/corporation.json').data;
const testCompanyData = require('./seeder/data/company.json').data;
const customTools = require('./basic/custom-tools');
const Base = require('./basic/basic');
const App = require('../app');

describe('刪除公司角色權限', () => {
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
    let defaultId = '';
    let inUsedId = '';
    beforeAll(async (done) => {
      const col = NativeDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
      const data1 = {
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
      await col.insertOne(data1);
      const obj1 = await col.findOne({ companyId: data1.companyId, role: data1.role });
      defaultId = obj1._id.toString();

      const data2 = {
        companyId: ObjectId(testCompanyData[0]._id),
        role: 1005,
        name: '管理者',
        manageAuthLevel: 0,
        isDefault: false,
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
      await col.insertOne(data2);
      const obj2 = await col.findOne({ companyId: data2.companyId, role: data2.role });
      inUsedId = obj2._id.toString();

      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      const keys = await fsExtra.readJson(testCorpData[0].__enc.provider);
      const secretKey = keys[testCorpData[0].__enc.keyId];
      const personData = {
        corpId: ObjectId(testCorpData[0]._id),
        name: {
          cipher: await customTools.encryptionWithAESCBCPKCS7('測試管理者2號', secretKey.key, secretKey.iv)
        },
        employee: {
          comPersonMgmt: [{
            companyId: ObjectId(testCompanyData[0]._id),
            roles: [data2.role],
          }],
        },
        valid: true,
        __vn: 0,
        __cc: '',
        __sc: '',
      }
      await personCol.insertOne(personData);
      done();
    });

    test('[400:21127] 此角色被使用中', async (done) => {
      const res = await agent
        .delete(`${_ENDPOINT}/${inUsedId}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21127,
        message: '此角色被使用中',
        result: null,
      });
      done();
    });
    test('[400:21128] 此角色為預設', async (done) => {
      const res = await agent
        .delete(`${_ENDPOINT}/${defaultId}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21128,
        message: '此角色為預設',
        result: null,
      });
      done();
    });
    test('[404] 公司角色Id不存在', async (done) => {
      const res = await agent
        .delete(`${_ENDPOINT}/oooxxxoooxxxoooxxx`)
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
  });

  describe('成功', () => {
    let id = '';
    let data = {};
    beforeAll(async (done) => {
      const col = NativeDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
      data = {
        companyId: ObjectId(testCompanyData[0]._id),
        role: 1000,
        name: '管理者2',
        manageAuthLevel: 0,
        isDefault: false,
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

    test('[200] 刪除公司角色權限-成功', async (done) => {
      const res = await agent
        .delete(`${_ENDPOINT}/${id}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      const col = NativeDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
      const obj = await col.findOne({ companyId: data.companyId, role: data.role });
      expect(res.status).toBe(200);
      expect(obj.valid).toBe(false);
      expect(obj.__vn).toBe(data.__vn+1);
      expect(obj.__cc).toBe(res.body.traceId);
      expect(obj.__sc).toBe('Erpv3');
      done();
    });
  });
});
