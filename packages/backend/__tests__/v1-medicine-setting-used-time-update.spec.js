/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-medicine-setting-used-time-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-08-08 04:52:17 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('更新用藥時間', () => {
  const METHOD = 'PATCH';
  const _ENDPOINT = '/main/app/api/v1/medicineSettings/medicineUsedTime';
  let agent;
  let headers;
  let data;

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

    data = {
      companyId: new ObjectId(testCompanyData[0]._id),
      beforeBreakfast: '08:30',
      afterBreakfast: '',
      beforeLunch: '11:45',
      afterLunch: '13:30',
      beforeDinner: '',
      afterDinner: '',
      beforeBedtime: '',
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    };
    const medicineUsedTimeCol = NativeDBClient.getCollection(modelCodes.MEDICINEUSEDTIME);
    await medicineUsedTimeCol.insertOne(data);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:11102] 公司ID空白', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {companyId: ''});
      Base.verifyError(res, 11102, '公司ID空白');
      done();
    });
    test('[400:21200] 用藥時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.afterDinner = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21200, '用藥時間格式有誤');
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:20008] 資料公司不相同', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.companyId = testCompanyData[1]._id.toString();
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 20008, '資料公司不相同');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 更新用藥時間-成功', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.afterDinner = '20:30';
      _data.beforeBedtime = '23:45';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      const medicineUsedTimeCol = NativeDBClient.getCollection(modelCodes.MEDICINEUSEDTIME);
      const dbData = await medicineUsedTimeCol.findOne({ companyId: ObjectId(_data.companyId) });

      expect(res.status).toBe(200);
      expect(dbData.beforeBreakfast).toBe(_data.beforeBreakfast);
      expect(dbData.afterBreakfast).toBe(_data.afterBreakfast);
      expect(dbData.beforeLunch).toBe(_data.beforeLunch);
      expect(dbData.afterLunch).toBe(_data.afterLunch);
      expect(dbData.beforeDinner).toBe(_data.beforeDinner);
      expect(dbData.afterDinner).toBe(_data.afterDinner);
      expect(dbData.beforeBedtime).toBe(_data.beforeBedtime);
      done();
    });

    test('[200] 更新用藥時間-成功(新建立)', async (done) => {
      const medicineUsedTimeCol = NativeDBClient.getCollection(modelCodes.MEDICINEUSEDTIME);
      await medicineUsedTimeCol.deleteOne({ companyId: data.companyId });

      const _data = lodash.cloneDeep(data);
      _data.afterDinner = '20:30';
      _data.beforeBedtime = '23:45';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      const dbData = await medicineUsedTimeCol.findOne({ companyId: ObjectId(_data.companyId) });

      expect(res.status).toBe(200);
      expect(dbData.beforeBreakfast).toBe(_data.beforeBreakfast);
      expect(dbData.afterBreakfast).toBe(_data.afterBreakfast);
      expect(dbData.beforeLunch).toBe(_data.beforeLunch);
      expect(dbData.afterLunch).toBe(_data.afterLunch);
      expect(dbData.beforeDinner).toBe(_data.beforeDinner);
      expect(dbData.afterDinner).toBe(_data.afterDinner);
      expect(dbData.beforeBedtime).toBe(_data.beforeBedtime);
      done();
    });
  });
});
