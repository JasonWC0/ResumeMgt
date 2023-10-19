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

describe('更新顧客資料', () => {
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
    const personData = testData.person[1];
    personData._id = ObjectId(personData._id);
    await personCol.insertOne(personData);
    _ENDPOINT = _ENDPOINT + `/${personData._id}`

    customerObj.caregivers.secondary = {
      "personId": "6209f71974ac715080d36700",
      "relationship": "拜把兄弟",
      "note": "無"
    };
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
    test('[400:20115] 顧客角色資料為空', async (done) => {
      const _data = _.cloneDeep(customerObj);
      _data.cusRoles[0].roles = [];
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testData.person[1].__vn,
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
    test('[404:90008] 個人Id不存在', async (done) => {
      const _data = _.cloneDeep(customerObj);
      const res = await agent
        .patch(`/main/app/api/v1/customers/abcdef0123456789`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testData.person[1].__vn,
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

    test('[400:20115] 顧客角色資料有誤', async (done) => {
      const _data = _.cloneDeep(customerObj);
      _data.cusRoles = [{
        "companyId": "abcdef0123456789",
        "roles": [0, 100]
      }];
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testData.person[1].__vn,
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

    test('[400:20116] 聯絡人個人ID空白', async (done) => {
      const _data = _.cloneDeep(customerObj);
      _data.contacts[0].personId = "";
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testData.person[1].__vn,
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

    test('[400:20117] 代理人個人ID空白', async (done) => {
      const _data = _.cloneDeep(customerObj);
      _data.agent.personId = '';
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testData.person[1].__vn,
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

    test('[400:20118] 照顧人個人ID空白', async (done) => {
      const _data = _.cloneDeep(customerObj);
      _data.caregivers.primary.personId = '';
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testData.person[1].__vn,
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

    test('[400:90010] 資料版號有誤(低於現有版本)', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send({ caregivers: customerObj.caregivers })
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
    test('[200] 更新顧客資料-成功', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send({ caregivers: customerObj.caregivers })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testData.person[1].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      const uPerson = await personCol.findOne({ _id: ObjectId(testData.person[1]._id)});
      expect(uPerson.customer.caregivers.primary.personId.toString()).toBe(customerObj.caregivers.primary.personId);
      expect(uPerson.customer.caregivers.secondary.personId.toString()).toBe(customerObj.caregivers.secondary.personId);
      expect(uPerson.customer.agent.personId.toString()).toBe(testData.person[1].customer.agent.personId);
      expect(uPerson.__vn).toBe(testData.person[1].__vn+1);
      expect(uPerson.__sc).toBe('Erpv3');
      expect(uPerson.__cc).toBe(res.body.traceId);
      done();
    });
  });
})
