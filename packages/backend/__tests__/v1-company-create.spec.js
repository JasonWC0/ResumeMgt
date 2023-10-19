/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-company-create.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-03-16 03:56:20 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const corpData = require('./seeder/data/corporation.json');
const testCompanyData = require('./seeder/data/company.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('建立公司', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/companies';
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
      companyId: 'testCompanyId'
    }
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:10013] 檔案Id空白 (組織圖的檔案Id空白)', async (done) => {
      const _data = lodash.cloneDeep(testCompanyData.data[0]);
      _data.organizationalChart.id = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);

      Base.verifyError(res, 10013, '檔案Id空白')
      done();
    });

    test('[500:90001] code重複', async (done) => {
      const _data = lodash.cloneDeep(testCompanyData.data[0]);
      _data.code = testCompanyData.data[0].code;
      _data.shortName = 'newShortName';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21143, '公司簡碼已存在');
      done();
    });

    test('[500:90001] shortName重複', async (done) => {
      const _data = lodash.cloneDeep(testCompanyData.data[0]);
      _data.code = 'newCode';
      _data.shortName = testCompanyData.data[0].shortName;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21144, '公司短名已存在');
      done();
    });
  });

  describe('成功', () => {
    const newCorpId = '6245420965ae741e0037da62';
    beforeAll(async (done) => {
      const corpCol = NativeDBClient.getCollection(modelCodes.CORPORATION);
      const corp = corpData.data[0];
      corp._id = ObjectId(newCorpId)
      corp.shortName = '仁寶';
      corp.code = 'compal';
      await corpCol.insertOne(corp);
      done();
    });

    test('[200] 建立公司-成功', async (done) => {
      const compData = lodash.cloneDeep(testCompanyData.data[0]);
      delete compData._id;
      delete compData.valid;
      compData.corpId = newCorpId;
      compData.fullName = 'testtest';
      compData.shortName = 'testtest';
      compData.code = 'testtest';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, compData);

      const id = res.body.result.id;
      const companyCol = NativeDBClient.getCollection(modelCodes.COMPANY);
      const companyRes = await companyCol.findOne({ _id: ObjectId(id), valid: true });

      expect(res.status).toBe(200);
      expect(companyRes.fullName).toBe(compData.fullName);
      expect(companyRes.shortName).toBe(compData.shortName);
      expect(companyRes.displayName).toBe(compData.displayName);
      done();
    });
  });
});
