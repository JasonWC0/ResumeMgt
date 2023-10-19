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
const { ObjectId } = require('mongodb');
const _ = require('lodash');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testData = require('./seeder/data/customer.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('建立顧客', () => {
  let agent;
  let loginData;
  let personCol;
  const customerObj = testData.data[0];

  let _ENDPOINT = `/main/app/api/v1/customers`;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    personCol = NativeDBClient.getCollection(modelCodes.PERSON);
    const personData = testData.person[0];
    personData._id = ObjectId(personData._id);
    await personCol.insertOne(personData);
    _ENDPOINT = _ENDPOINT + `/${personData._id}`;

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
    test('[400:10108] 顧客腳色資料為空', async (done) => {
      const _data = _.cloneDeep(customerObj);
      _data.cusRoles[0].roles = [];
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10108,
        message: '顧客腳色資料為空',
        result: null,
      });
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[404:90008] URI not found-人員Id不存在', async (done) => {
      const _data = _.cloneDeep(customerObj);
      const fakePersonId = 'abcdef0123456789';
      const res = await agent
        .post(`/main/app/api/v1/customers/${fakePersonId}`)
        .send(_data)
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

    test('[400:20114] 顧客角色資料有誤', async (done) => {
      const _data = _.cloneDeep(customerObj);
      _data.cusRoles = [{
        "companyId": "abcdef0123456789",
        "roles": [0, 100]
      }];
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20114,
        message: '顧客腳色資料有誤',
        result: null,
      });
      done();
    });

    test('[400:10101] 個人ID空白-聯絡人', async (done) => {
      const _data = _.cloneDeep(customerObj);
      _data.contacts[0].personId = "";
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10101,
        message: '個人ID空白',
        result: null,
      });
      done();
    });

    test('[400:10101] 個人ID空白-代理人', async (done) => {
      const _data = _.cloneDeep(customerObj);
      _data.agent.personId = '';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10101,
        message: '個人ID空白',
        result: null,
      });
      done();
    });

    test('[400:10101] 個人ID空白-照顧人', async (done) => {
      const _data = _.cloneDeep(customerObj);
      _data.caregivers.primary.personId = '';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10101,
        message: '個人ID空白',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[200] 建立顧客-成功', async (done) => {
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(customerObj)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      const oPerson = await personCol.findOne({ _id: ObjectId(testData.person[0]._id) });
      expect(oPerson.customer.contacts).toHaveLength(1);
      expect(oPerson.customer.contacts[0].personId.toString()).toBe(customerObj.contacts[0].personId);
      expect(oPerson.customer.agent.personId.toString()).toBe(customerObj.agent.personId);
      expect(oPerson.customer.caregivers.primary.personId.toString()).toBe(customerObj.caregivers.primary.personId);
      expect(oPerson.customer.caregivers.secondary.personId.toString()).toBe(customerObj.caregivers.secondary.personId);
      done();
    });
  });
})
