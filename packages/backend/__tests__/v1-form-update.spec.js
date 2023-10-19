/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-form-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-03-08 02:38:52 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testFormData = require('./seeder/data/form.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('更新表單範本資料', () => {
  const _ENDPOINT = '/main/app/api/v1/forms';
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
    test('[400:10501] 表單範本服務類別空白', async (done) => {
      const _data = lodash.cloneDeep(testFormData.data[0]);
      _data.serviceTypes = [];
      const res = await agent
        .patch(`${_ENDPOINT}/${testFormData.data[0]._id}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testFormData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10501,
        message: '表單範本服務類別空白',
        result: null,
      });
      done();
    });
    test('[400:10502] 表單範本名稱空白', async (done) => {
      const _data = lodash.cloneDeep(testFormData.data[0]);
      _data.name = '';
      const res = await agent
        .patch(`${_ENDPOINT}/${testFormData.data[0]._id}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testFormData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10502,
        message: '表單範本名稱空白',
        result: null,
      });
      done();
    });
    test('[400:10503] 表單範本審核類別空白', async (done) => {
      const _data = lodash.cloneDeep(testFormData.data[0]);
      _data.reviewType = '';
      const res = await agent
        .patch(`${_ENDPOINT}/${testFormData.data[0]._id}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testFormData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10503,
        message: '表單範本審核類別空白',
        result: null,
      });
      done();
    });
    test('[400:10504] 表單範本審核角色空白', async (done) => {
      // set reviewType = 1
      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      await formCol.updateOne({ _id: ObjectId(testFormData.data[0]._id) }, { $set: { reviewType: 1 } });

      const _data = lodash.cloneDeep(testFormData.data[0]);
      _data.reviewRoles = [];
      const res = await agent
        .patch(`${_ENDPOINT}/${testFormData.data[0]._id}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testFormData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10504,
        message: '表單範本審核角色空白',
        result: null,
      });
      done();
    });
    test('[400:20501] 表單範本服務類別不存在', async (done) => {
      const _data = lodash.cloneDeep(testFormData.data[0]);
      _data.serviceTypes = ['test'];
      const res = await agent
        .patch(`${_ENDPOINT}/${testFormData.data[0]._id}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testFormData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20501,
        message: '表單範本服務類別不存在',
        result: null,
      });
      done();
    });
    test('[400:20502] 表單範本審核類別格式有誤', async (done) => {
      const _data = lodash.cloneDeep(testFormData.data[0]);
      _data.reviewType = 100;
      const res = await agent
        .patch(`${_ENDPOINT}/${testFormData.data[0]._id}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testFormData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20502,
        message: '表單範本審核類別格式有誤',
        result: null,
      });
      done();
    });
    test('[400:20503] 表單範本審核角色不存在', async (done) => {
      const _data = lodash.cloneDeep(testFormData.data[0]);
      _data.reviewRoles = [['test']];
      const res = await agent
        .patch(`${_ENDPOINT}/${testFormData.data[0]._id}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testFormData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20503,
        message: '表單範本審核角色不存在',
        result: null,
      });
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[404:90008] 表單Id不存在', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}/0000x0000x0000`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testFormData.data[0].__vn,
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
      const _data = lodash.cloneDeep(testFormData.data[0]);
      _data.displayGroup = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testFormData.data[0]._id}`)
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
    test('[200] 更新表單範本資料-成功', async (done) => {
      const _data = lodash.cloneDeep(testFormData.data[0]);
      _data.displayGroup = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testFormData.data[0]._id}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testFormData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.findOne({ _id: ObjectId(testFormData.data[0]._id) });

      expect(res.status).toBe(200);
      expect(_data.serviceTypes).toEqual(formData.serviceTypes);
      expect(_data.category).toBe(formData.category);
      expect(_data.type).toBe(formData.type);
      expect(_data.name).toBe(formData.name);
      expect(_data.version).toBe(formData.version);
      expect(_data.reviewType).toBe(formData.reviewType);
      expect(_data.reviewRoles).toEqual(formData.reviewRoles);
      expect(_data.frequency).toBe(formData.frequency);
      expect(_data.displayGroup).toBe(formData.displayGroup);
      expect(_data.fillRoles).toEqual(formData.fillRoles);
      expect(_data.viewRoles).toEqual(formData.viewRoles);
      expect(formData.__vn).toBe(testFormData.data[0].__vn+1);
      expect(formData.__sc).toBe('Erpv3');
      expect(formData.__cc).toBe(res.body.traceId);
      done();
    });
  });
});
