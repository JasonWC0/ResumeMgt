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
const fsExtra = require('fs-extra');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const customTools = require('./basic/custom-tools');
const NativeDBClient = require('./basic/native-db-client');
const corpData = require('./seeder/data/corporation.json');
const testPersonData = require('./seeder/data/person.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('刪除人員資料', () => {
  const _ENDPOINT = '/main/app/api/v1/persons';
  let agent;
  let loginData;
  let createData = testPersonData.data[0];
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
    test('[404:90008] 查不到此人員', async (done) => {
      const res = await agent
        .delete(`${_ENDPOINT}/hellomoto`)
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
    test('[200]] 刪除人員資料-成功', async (done) => {
      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      const oPerson = await personCol.findOne({...createData});
      const res = await agent
        .delete(`${_ENDPOINT}/${createData._id}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      const personData = await personCol.findOne({ _id: ObjectId(createData._id) });
      expect(res.status).toBe(200);
      expect(personData.valid).toBe(false);
      expect(personData.__vn).toBe(oPerson.__vn+1);
      expect(personData.__cc).toBe(res.body.traceId);
      expect(personData.__sc).toBe('Erpv3');
      done();
    });
  });
})
