/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-read-company-info.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-02-14 11:37:57 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('取得公司基本資料', () => {
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

  describe('資料規則驗證', () => {
    test('[404:90008] 公司Id不存在', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}/0000x0000x0000/info`)
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
    test('[404:90008] 公司資料類型不存在', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}/${testCompanyData.data[0]._id}/test`)
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
    })
  });

  describe('成功', () => {
    test('[200] 取得公司基本資料-成功', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}/${testCompanyData.data[0]._id}/info`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id
        });

      const companyCol = NativeDBClient.getCollection(modelCodes.COMPANY);
      const companyData = await companyCol.findOne({ _id: testCompanyData.data[0]._id });

      expect(res.status).toBe(200);
      expect(res.body.result.fullName).toBe(companyData.fullName);
      expect(res.body.result.shortName).toBe(companyData.shortName);
      expect(res.body.result.taxId).toBe(companyData.taxId);
      expect(res.body.result.licenseNumber).toBe(companyData.licenseNumber);
      expect(res.body.result.phone).toBe(companyData.phone);
      expect(res.body.result.fax).toBe(companyData.fax);
      expect(res.body.result.registerPlace.postalCode).toBe(companyData.registerPlace.postalCode);
      expect(res.body.result.registerPlace.city).toBe(companyData.registerPlace.city);
      expect(res.body.result.registerPlace.region).toBe(companyData.registerPlace.region);
      expect(res.body.result.registerPlace.village).toBe(companyData.registerPlace.village);
      expect(res.body.result.registerPlace.neighborhood).toBe(companyData.registerPlace.neighborhood);
      expect(res.body.result.registerPlace.road).toBe(companyData.registerPlace.road);
      expect(res.body.result.registerPlace.others).toBe(companyData.registerPlace.others);
      expect(res.body.result.bankAccount).toEqual(companyData.bankAccount);
      expect(res.body.result.bankAccount2nd).toEqual(companyData.bankAccount2nd);
      expect(res.body.result.vn).toBe(companyData.__vn);
      done();
    });
  });
})
