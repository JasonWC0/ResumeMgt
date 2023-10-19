/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-company-form-list-read.spec.js
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

  describe('資料規則驗證', () => {
    test('[404:90008] 公司Id不存在', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}/0000x0000x0000/forms`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id
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
    test('[200]] 取得公司可用表單列表(無主分類)-成功', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}/${testCompanyData.data[0]._id}/forms`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id
        });

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(testCompanyData.data[0]._id), inUse: true, valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(formData.length);
      done();
    });

    test('[200] 取得公司可用表單列表(有主分類)-成功', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}/${testCompanyData.data[0]._id}/forms`)
        .query({ category: 'evaluation'})
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id
        });

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(testCompanyData.data[0]._id), category: 'evaluation', inUse: true, valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(formData.length);
      done();
    });

    test('[200] 取得公司可用表單列表(有主分類)-成功', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}/${testCompanyData.data[0]._id}/forms`)
        .query({ category: 'record'})
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id
        });

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(testCompanyData.data[0]._id), category: 'record', inUse: true, valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(formData.length);
      done();
    });

    test('[200] 取得公司可用表單列表(有服務類別)-成功', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}/${testCompanyData.data[0]._id}/forms`)
        .query({ serviceType: 'HC,AC' })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id
        });

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(testCompanyData.data[0]._id), serviceTypes: { $in: ['HC', 'AC']}, inUse: true, valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(formData.length);
      done();
    });

    test('[200] 取得公司可用表單列表(有主分類和服務類別)-成功', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}/${testCompanyData.data[0]._id}/forms`)
        .query({ category: 'evaluation', serviceType: 'HC,test' })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id
        });

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(testCompanyData.data[0]._id), category: 'evaluation', serviceTypes: { $in: ['HC', 'test']}, inUse: true, valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(formData.length);
      done();
    });

    test('[200]] 取得公司可用表單列表(無主分類&有頻率)-成功', async (done) => {
      const headers = {
        Authorization: `Bearer ${loginData.token}`,
        vn: '',
        sc: 'Erpv3',
        companyId: testCompanyData.data[0]._id
      }
      const res = await Base.callAPI(agent, 'GET', `${_ENDPOINT}/${testCompanyData.data[0]._id}/forms`, headers, {}, { hasFrequency: true });

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(testCompanyData.data[0]._id), valid: true, inUse: true, $and:[ { frequency: { $exists: true } }, { frequency: { $nin: [null, ''] } }] }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(formData.length);
      done();
    });
  });
});
