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
const _ = require('lodash');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const testData = require('./seeder/data/employee.json');
const companyData = require('./seeder/data/company.json');
const ObjectID = require('mongodb').ObjectID;
const { KeyCloakClient } = require('@erpv3/app-common/shared/connection-clients');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');

describe('刪除員工資料', () => {
  let agent;
  let loginData;
  let personCol;
  let oPerson;
  const personData = testData.person[0];
  let _ENDPOINT = `/main/app/api/v1/employees`;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();

    const companyCol = NativeDBClient.getCollection(modelCodes.COMPANY);
    let insertCompanyData = companyData.data[0];
    insertCompanyData._id = ObjectID(insertCompanyData._id);
    await companyCol.insertOne(insertCompanyData);

    personCol = NativeDBClient.getCollection(modelCodes.PERSON);
    personData._id = ObjectID(personData._id);
    await personCol.insertOne(personData);
    oPerson = await personCol.findOne({});
    _ENDPOINT = _ENDPOINT + `/${oPerson._id}`

    agent = request.agent(new App().app);
    loginData = await Base.login(agent);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
    done();
  })

  describe('資料規則驗證', () => {
    test('[404:90008] 查無此人員', async (done) => {
      const res = await agent
        .delete(`/main/app/api/v1/employees/abcdef0123456789`)
        .query({ companyId: oPerson.employee.comPersonMgmt[0].companyId})
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
    test('[400:20112] 員工資料不存在', async (done) => {
      const res = await agent
        .delete(`${_ENDPOINT}`)
        .query({ companyId: 'hellokitty'})
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20112,
        message: '員工資料不存在',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[200] 刪除員工資訊-成功', async (done) => {
      KeyCloakClient.adminLogin.mockResolvedValue({ access_token: '' });
      KeyCloakClient.deleteUser.mockResolvedValue(true);
      const befRes = await personCol.findOne({});
      let emps = befRes.employee.comPersonMgmt.find((c) => c.companyId.toString() === oPerson.employee.comPersonMgmt[0].companyId);
      expect(emps).toBeTruthy();
      const res = await agent
        .delete(`${_ENDPOINT}`)
        .query({ companyId: oPerson.employee.comPersonMgmt[0].companyId})
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);

      const updRes = await personCol.findOne({});
      emps = updRes.employee.comPersonMgmt.find((c) => c.companyId.toString() === oPerson.employee.comPersonMgmt[0].companyId);
      expect(emps).toBeFalsy();
      expect(updRes.__vn).toBe(personData.__vn+1);
      expect(updRes.__sc).toBe('Erpv3');
      expect(updRes.__cc).toBe(res.body.traceId);
      done();
    });
  });
})
