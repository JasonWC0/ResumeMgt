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
const testData = require('./seeder/data/customer.json');
const companyData = require('./seeder/data/company.json');
const ObjectID = require('mongodb').ObjectID;
const corpData = require('./seeder/data/corporation.json');
const customTools = require('./basic/custom-tools');
const fsExtra = require('fs-extra');

describe('讀取顧客資料', () => {
  let agent;
  let loginData;
  let personCol;
  let oPerson;
  let serectKey;
  const personData = testData.person[0];
  const empCusPerson = testData.person[2];
  let _ENDPOINT = `/main/app/api/v1/customers`;

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

    const corpCol = NativeDBClient.getCollection(modelCodes.CORPORATION);
    const corp = corpData.data[0];
    corp._id = ObjectID(corp._id)
    await corpCol.insertOne(corp);

    const keys = await fsExtra.readJson(corp.__enc.provider);
    serectKey = keys[corp.__enc.keyId];

    personCol = NativeDBClient.getCollection(modelCodes.PERSON);
    personData._id = ObjectID(personData._id);
    personData.name = {
      cipher: await customTools.encryptionWithAESCBCPKCS7(personData.name, serectKey.key, serectKey.iv)
    }
    personData.email = {
      cipher: await customTools.encryptionWithAESCBCPKCS7(personData.email, serectKey.key, serectKey.iv)
    }
    personData.mobile = {
      cipher: await customTools.encryptionWithAESCBCPKCS7(personData.mobile, serectKey.key, serectKey.iv)
    }
    personData.personalId = {
      cipher: await customTools.encryptionWithAESCBCPKCS7(personData.personalId, serectKey.key, serectKey.iv)
    }

    await personCol.insertOne(personData);
    empCusPerson._id = ObjectID(empCusPerson._id);
    await personCol.insertOne(empCusPerson);
    oPerson = await personCol.findOne({}); 

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
    test('[404:90008] 個人Id不存在', async (done) => {
      const res = await agent
        .get(_ENDPOINT + `/abcdef0123456789`)
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
    test.only('[400:20101] 顧客資料為空', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}` + `/${empCusPerson._id}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10107,
        message: '顧客資料為空',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[200] 讀取顧客資料-成功', async (done) => {
      const res = await agent
        .get(_ENDPOINT + `/${oPerson._id}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      expect(res.body.result.name).toBe(await customTools.decryptionWithAESCBCPKCS7(oPerson.name.cipher, serectKey.key, serectKey.iv));
      expect(res.body.result.email).toBe(await customTools.decryptionWithAESCBCPKCS7(oPerson.email.cipher, serectKey.key, serectKey.iv));
      expect(res.body.result.agent).toMatchObject(personData.customer.agent);
      expect(res.body.result.vn).toBe(0);
      done();
    });
  });
})
