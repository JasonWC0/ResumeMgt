/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-medicine-setting-commonly-used-name-update-list.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-08-11 04:49:26 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 *
 * Last Modified: 2022-08-11 04:56:18 pm
 * Modified By: Joyce Hsu (joyces_hsu@compal.com)
 * tag
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('更新用藥常用名稱', () => {
  const METHOD = 'PATCH';
  const _ENDPOINT = '/main/app/api/v1/medicineSettings/commonlyUsedName';
  let agent;
  let headers;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    const loginData = await Base.login(agent);
    headers = {
      Authorization: `Bearer ${loginData.token}`,
      vn: 0,
      sc: 'Erpv3',
      companyId: testCompanyData[0]._id
    }

    const data = [{
      companyId: new ObjectId(testCompanyData[0]._id),
      type: 'hospital',
      name: ['台大', '長庚'],
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    },{
      companyId: new ObjectId(testCompanyData[0]._id),
      type: 'doctor',
      name: ['王醫生', '張醫生'],
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    }];
    const commonlyUsedNameCol = NativeDBClient.getCollection(modelCodes.COMMONLYUSEDNAME);
    await commonlyUsedNameCol.insertMany(data);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:11102] 公司ID空白', async (done) => {
      const _data = {
        companyId: '',
        name: ['馬偕', '北醫'],
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/hospital`, headers, _data);
      Base.verifyError(res, 11102, '公司ID空白');
      done();
    });
    test('[400:21201] 用藥常用名稱分類有誤', async (done) => {
      const _data = {
        companyId: testCompanyData[0]._id.toString(),
        name: ['馬偕', '北醫'],
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/test`, headers, _data);
      Base.verifyError(res, 21201, '用藥常用名稱分類有誤');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 更新用藥常用名稱-成功(取代資料)', async (done) => {
      const _data = {
        companyId: testCompanyData[0]._id.toString(),
        name: ['馬偕', '北醫', '台大'],
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/hospital`, headers, _data);

      const commonlyUsedNameCol = NativeDBClient.getCollection(modelCodes.COMMONLYUSEDNAME);
      const dbData = await commonlyUsedNameCol.findOne({ companyId: testCompanyData[0]._id, type: 'hospital' })

      expect(res.status).toBe(200);
      expect(dbData.name).toEqual(['馬偕', '北醫', '台大']);
      done();
    });
    test('[200] 新增用藥常用名稱-成功(新增並寫入空資料)', async (done) => {
      const commonlyUsedNameCol = NativeDBClient.getCollection(modelCodes.COMMONLYUSEDNAME);
      await commonlyUsedNameCol.deleteOne({ companyId: testCompanyData[0]._id, type: 'doctor' });
      const _data = {
        companyId: testCompanyData[0]._id.toString(),
        name: [],
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/doctor`, headers, _data);

      const dbData = await commonlyUsedNameCol.findOne({ companyId: testCompanyData[0]._id, type: 'doctor' })

      expect(res.status).toBe(200);
      expect(dbData.name).toEqual([]);
      done();
    });
  });
});
 
