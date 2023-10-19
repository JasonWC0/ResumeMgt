/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-company-delete.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-03-16 05:00:06 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('刪除公司', () => {
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

  describe('成功', () => {
    test('[200] 刪除公司-成功', async (done) => {
      const res = await agent
        .delete(`${_ENDPOINT}/${testCompanyData.data[0]._id}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      const companyCol = NativeDBClient.getCollection(modelCodes.COMPANY);
      const companyRes = await companyCol.findOne({ _id: ObjectId(testCompanyData.data[0]._id) });

      expect(res.status).toBe(200);
      expect(companyRes.valid).toBe(false);
      expect(companyRes.__vn).toBe(testCompanyData.data[0].__vn+1);
      expect(companyRes.__sc).toBe('Erpv3');
      expect(companyRes.__cc).toBe(res.body.traceId);
      done();
    });
  });
});
