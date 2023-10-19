/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-form-read-list.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-03-07 04:06:42 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('取得公司可用表單列表', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/forms';
  let agent;
  let loginData;
  let headers;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    loginData = await Base.login(agent);
    headers = {
      Authorization: `Bearer ${loginData.token}`,
      vn: '',
      sc: 'Erpv3',
      companyId: testCompanyData.data[0]._id,
    };
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位驗證', () => {
    test('[400:11102] 公司Id空白', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { companyId: '' });
      Base.verifyError(res, 11102, '公司ID空白');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 取得公司可用表單列表(無主分類)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { companyId: `${testCompanyData.data[0]._id}` });

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(testCompanyData.data[0]._id), inUse: true, valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(formData.length);
      done();
    });

    test('[200] 取得公司可用表單列表(有主分類)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { companyId: `${testCompanyData.data[0]._id}`, category: 'evaluation' });

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(testCompanyData.data[0]._id), category: 'evaluation', inUse: true, valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(formData.length);
      done();
    });

    test('[200] 取得公司可用表單列表(有主分類)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { companyId: `${testCompanyData.data[0]._id}`, category: 'record' });

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(testCompanyData.data[0]._id), category: 'record', inUse: true, valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(formData.length);
      done();
    });

    test('[200] 取得公司可用表單列表(有服務類別)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { companyId: `${testCompanyData.data[0]._id}`, serviceType: 'HC,AC' });

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(testCompanyData.data[0]._id), serviceTypes: { $in: ['HC', 'AC']}, inUse: true, valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(formData.length);
      done();
    });

    test('[200] 取得公司可用表單列表(有主分類和服務類別)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { companyId: `${testCompanyData.data[0]._id}`, category: 'evaluation', serviceType: 'HC,test' });

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(testCompanyData.data[0]._id), category: 'evaluation', serviceTypes: { $in: ['HC', 'test']}, inUse: true, valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(formData.length);
      const adlData = res.body.result.find((f) => f.type === 'adl');
      expect(adlData.signatures[0]._id).toBe('62bd44acab11f87f2bf3ba5b');
      expect(adlData.signatures[0].label).toBe('填表人');
      expect(adlData.signatures[0].name).toBe('filler');
      done();
    });

    test('[200] 取得公司可用含歷史表單列表(無主分類)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { companyId: `${testCompanyData.data[0]._id}`, history: true });

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(testCompanyData.data[0]._id), valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(formData.length);
      done();
    });

    test('[200] 取得公司可用表單列表(無主分類和篩選有頻率)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { companyId: `${testCompanyData.data[0]._id}`, hasFrequency: true });

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(testCompanyData.data[0]._id), valid: true, inUse: true, $and:[ { frequency: { $exists: true } }, { frequency: { $nin: [null, ''] } }] }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(formData.length);
      done();
    });

    test('[200] 取得公司可用表單列表(無主分類和篩選無頻率)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { companyId: `${testCompanyData.data[0]._id}`, hasFrequency: false });

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(testCompanyData.data[0]._id), valid: true, inUse: true, $or:[ { frequency: { $exists: false } }, { frequency: { $in: [null, ''] } }] }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(formData.length);
      done();
    });
  });
});
