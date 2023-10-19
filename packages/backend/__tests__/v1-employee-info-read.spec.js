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
const lodash = require('lodash');
const modelCodes = require('./enums/model-codes');
const customTools = require('./basic/custom-tools');
const NativeDBClient = require('./basic/native-db-client');
const testData = require('./seeder/data/employee.json');
const corpData = require('./seeder/data/corporation.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('讀取員工資訊', () => {
  let agent;
  let loginData;
  let personCol;
  let oPerson;
  let _ENDPOINT = `/main/app/api/v1/employees`;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    const corp = corpData.data[0];
    const keys = await fsExtra.readJson(corp.__enc.provider);
    const secretKey = keys[corp.__enc.keyId];

    personCol = NativeDBClient.getCollection(modelCodes.PERSON);
    const personData = lodash.cloneDeep(testData.person[0]);
    personData._id = ObjectId(personData._id);
    personData.corpId = ObjectId(corp._id);
    personData.name = {
      cipher: await customTools.encryptionWithAESCBCPKCS7(personData.name, secretKey.key, secretKey.iv)
    }
    personData.email = {
      cipher: await customTools.encryptionWithAESCBCPKCS7(personData.email, secretKey.key, secretKey.iv)
    }
    personData.mobile = {
      cipher: await customTools.encryptionWithAESCBCPKCS7(personData.mobile, secretKey.key, secretKey.iv)
    }
    personData.personalId = {
      cipher: await customTools.encryptionWithAESCBCPKCS7(personData.personalId, secretKey.key, secretKey.iv)
    }
    personData.employee.comPersonMgmt[0].supervisorId = ObjectId(personData.employee.comPersonMgmt[0].supervisorId);
    personData.employee.comPersonMgmt[0].supervisor2Id = ObjectId(personData.employee.comPersonMgmt[0].supervisor2Id);
    personData.employee.comPersonMgmt[0].startDate = new Date(personData.employee.comPersonMgmt[0].startDate.replace('/', '-'))
    personData.employee.comPersonMgmt[0].endDate = new Date(personData.employee.comPersonMgmt[0].endDate.replace('/', '-'))
    await personCol.insertOne(personData);
    oPerson = await personCol.findOne({ corpId: personData.corpId, personalId: personData.personalId});
    _ENDPOINT = _ENDPOINT + `/${oPerson._id}`

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
    test('[404:90008] 查無此員工', async (done) => {
      const res = await agent
        .get(`/main/app/api/v1/employees/abcdef0123456789`)
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
        .get(`${_ENDPOINT}`)
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
    test('[200] 讀取員工資訊-成功', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({ companyId: oPerson.employee.comPersonMgmt[0].companyId })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      expect(res.body.result.name).toBe(testData.person[0].name);
      expect(res.body.result.email).toBe(testData.person[0].email);
      expect(res.body.result.note).toBe(testData.person[0].note);
      expect(res.body.result.centralGovSystemAccount).toBe(oPerson.employee.comPersonMgmt[0].centralGovSystemAccount);
      expect(res.body.result.employeeCategory).toBe(oPerson.employee.comPersonMgmt[0].employeeCategory);
      expect(res.body.result.salarySystem).toBe(oPerson.employee.comPersonMgmt[0].salarySystem);
      expect(res.body.result.vn).toBe(0);
      done();
    });
  });
})
