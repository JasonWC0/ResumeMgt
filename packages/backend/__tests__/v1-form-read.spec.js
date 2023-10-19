/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-form-read.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-03-08 10:49:04 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testFormData = require('./seeder/data/form.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('讀取表單範本資料', () => {
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
      companyId: testCompanyData[0]._id,
    };
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('資料規則驗證', () => {
    test('[404:90008] 表單Id不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/0000x0000x0000`, headers);
      expect(res.status).toBe(404);
      expect(res.body.code).toBe(90008);
      expect(res.body.message).toBe('URI not found');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 讀取表單範本資料-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0]._id}`, headers);

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.findOne({ _id: ObjectId(testFormData.data[0]._id) });

      expect(res.status).toBe(200);
      expect(res.body.result.serviceTypes).toEqual(formData.serviceTypes);
      expect(res.body.result.category).toBe(formData.category);
      expect(res.body.result.type).toBe(formData.type);
      expect(res.body.result.name).toBe(formData.name);
      expect(res.body.result.version).toBe(formData.version);
      expect(res.body.result.reviewType).toBe(formData.reviewType);
      expect(res.body.result.reviewRoles).toEqual(formData.reviewRoles);
      expect(res.body.result.frequency).toBe(formData.frequency);
      expect(res.body.result.displayGroup).toBe(formData.displayGroup);
      expect(res.body.result.fillRoles).toEqual(formData.fillRoles);
      expect(res.body.result.viewRoles).toEqual(formData.viewRoles);
      expect(res.body.result.signatures.length).toEqual(2);
      expect(res.body.result.vn).toBe(formData.__vn);
      done();
    });
  });
});
