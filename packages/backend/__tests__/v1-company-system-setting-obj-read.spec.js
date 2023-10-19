/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-company-system-setting-obj-read.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-26 04:19:34 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('取得公司參數設定特定欄位', () => {
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
  })

  describe('需求欄位檢查', () => {
    test('[404:90008] 公司Id不存在', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}/0000x0000x0000/systemSetting/isAdvancedSalaryMthEE`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
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
    test('[200] 取得公司參數設定特定欄位-成功', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}/${testCompanyData.data[0]._id}/systemSetting/isAdvancedSalaryMthEE`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      const companyCol = NativeDBClient.getCollection(modelCodes.COMPANY);
      const companyData = await companyCol.findOne({ _id: testCompanyData.data[0]._id });
      const systemData = companyData.systemSetting;

      expect(res.status).toBe(200);
      expect(res.body.result.isAdvancedSalaryMthEE).toEqual(systemData.isAdvancedSalaryMthEE);
      expect(res.body.result.vn).toBe(companyData.__vn);
      done();
    });
  });
})