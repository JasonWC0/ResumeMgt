/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-company-info-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-02-16 11:42:43 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testPersonData = require('./seeder/data/person.json');
const Base = require('./basic/basic');
const App = require('../app');
const _ = require('lodash');

describe('讀取人員資料', () => {
  const _ENDPOINT = '/main/app/api/v1/persons';
  let agent;
  let loginData;
  let query;
  const personData = _.cloneDeep(testPersonData.data[0]);
  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    personCol = NativeDBClient.getCollection(modelCodes.PERSON);
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
    test('[404:90008] 查無此人', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}/hellomoto`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
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
  });

  describe('成功', () => {
    test('[200] 讀取人員資料-成功', async (done) => {
      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      const oPerson = await personCol.findOne(query);
      const res = await agent
        .get(`${_ENDPOINT}/${oPerson._id.toString()}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      expect(res.body.result.name).toBe(personData.name);
      expect(res.body.result.mobile).toBe(personData.mobile);
      expect(res.body.result.personalId).toBe(personData.personalId);
      expect(res.body.result.gender).toBe(personData.gender);
      expect(res.body.result.customer).toBeTruthy();
      expect(res.body.result.customer.healthFile).toBeTruthy();
      expect(res.body.result.customer.foodFile).toBeTruthy();
      expect(res.body.result.vn).toBe(0);
      done();
    });
  });
})
