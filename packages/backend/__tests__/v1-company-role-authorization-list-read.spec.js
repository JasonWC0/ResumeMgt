/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-company-role-authorization-list-read.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-04-19 11:38:08 am
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

describe('取得公司角色列表', () => {
  const _ENDPOINT = '/main/app/api/v1/companies';
  let agent;
  let loginData;

  let data1 = {};
  let data2 = {};
  let defaultId = '';
  let inUsedId = '';
  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    loginData = await Base.login(agent);

    const col = NativeDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
    data1 = {
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
      __cc: '',
      __vn: 0,
      __sc: '',
    }
    await col.insertOne(data1);
    const obj1 = await col.findOne({ companyId: data1.companyId, role: data1.role });
    defaultId = obj1._id.toString();

    data2 = {
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
      __cc: '',
      __vn: 0,
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
          roles: [data1.role],
        }],
      },
      valid: true,
      __cc: '',
      __vn: 0,
      __sc: '',
    }
    await personCol.insertOne(personData);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('成功', () => {
    test('[200] 取得公司角色列表-成功', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}/${testCompanyData[0]._id}/roleAuthorizations`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      expect(res.body.result[0].id).toBe(defaultId);
      expect(res.body.result[0].role).toBe(data1.role);
      expect(res.body.result[0].name).toBe(data1.name);
      expect(res.body.result[0].manageAuthLevel).toBe(data1.manageAuthLevel);
      expect(res.body.result[0].isDefault).toBe(data1.isDefault);
      expect(res.body.result[0].isUsed).toBe(true);
      expect(res.body.result[0].vn).toBe(data1.__vn);
      expect(res.body.result[1].id).toBe(inUsedId);
      expect(res.body.result[1].role).toBe(data2.role);
      expect(res.body.result[1].name).toBe(data2.name);
      expect(res.body.result[1].manageAuthLevel).toBe(data2.manageAuthLevel);
      expect(res.body.result[1].isDefault).toBe(data2.isDefault);
      expect(res.body.result[1].isUsed).toBe(false);
      expect(res.body.result[1].vn).toBe(data2.__vn);
      done();
    });
  });
});
