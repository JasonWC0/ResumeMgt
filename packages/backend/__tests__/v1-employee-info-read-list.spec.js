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
const lodash = require('lodash');
const fsExtra = require('fs-extra');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const customTools = require('./basic/custom-tools');
const NativeDBClient = require('./basic/native-db-client');
const testData = require('./seeder/data/employee.json');
const companyData = require('./seeder/data/company.json');
const accountData = require('./seeder/data/account.json');
const corpData = require('./seeder/data/corporation.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('讀取公司員工資料列表', () => {
  const METHOD = 'GET';
  const _ENDPOINT = `/main/app/api/v1/employees`;
  let agent;
  let headers;
  let personCol;
  let serectKey;
  const query = {
    companyId: companyData.data[0]._id.toString()
  }

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();

    const companyCol = NativeDBClient.getCollection(modelCodes.COMPANY);
    let insertCompanyData = companyData.data[0];
    insertCompanyData._id = ObjectId(insertCompanyData._id);
    insertCompanyData.corpId = ObjectId(insertCompanyData.corpId);

    const corpCol = NativeDBClient.getCollection(modelCodes.CORPORATION);
    const corp = corpData.data[0];
    corp._id = ObjectId(corp._id);

    const accountCol = NativeDBClient.getCollection(modelCodes.ACCOUNT);

    await Promise.all([
      companyCol.insertOne(insertCompanyData),
      corpCol.insertOne(corp),
      accountCol.insertMany(accountData.data),
    ]);

    const keys = await fsExtra.readJson(corp.__enc.provider);
    serectKey = keys[corp.__enc.keyId];

    personCol = NativeDBClient.getCollection(modelCodes.PERSON);
    const employmentHistCol = NativeDBClient.getCollection(modelCodes.EMPLOYMENTHISTORY);
    const insertTasks = []
    const insertEmploymentHist = [];
    for await (const personData of testData.person) {
      personData._id = ObjectId(personData._id);
      personData.corpId = ObjectId(personData.corpId);
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
      personData.employee.comPersonMgmt = personData.employee.comPersonMgmt.map( (cpm) => {
        cpm.companyId = ObjectId(cpm.companyId);
        if (cpm.startDate) {
          cpm.startDate = new Date(cpm.startDate);
          insertEmploymentHist.push({
            personId: ObjectId(personData._id),
            companyId: ObjectId(cpm.companyId),
            date: new Date(cpm.startDate),
            status: 0,
            valid: true,
          });
        }
        if (cpm.endDate) {
          cpm.endDate = new Date(cpm.endDate)
          insertEmploymentHist.push({
            personId: ObjectId(personData._id),
            companyId: ObjectId(cpm.companyId),
            date: new Date(cpm.endDate),
            status: 1,
            valid: true,
          });
        }
        insertEmploymentHist.push({
          personId: ObjectId(personData._id),
          companyId: ObjectId(cpm.companyId),
          date: new Date('2022-05-01'),
          status: 1,
          valid: true,
        });
        insertEmploymentHist.push({
          personId: ObjectId(personData._id),
          companyId: ObjectId(cpm.companyId),
          date: new Date('2022-07-10'),
          status: 2,
          valid: true,
        });
        return cpm;
      } )
      insertTasks.push(personData);
    }
    await personCol.insertMany(insertTasks);
    await employmentHistCol.insertMany(insertEmploymentHist);

    agent = request.agent(new App().app);
    const loginData = await Base.login(agent);
    headers = {
      Authorization: `Bearer ${loginData.token}`,
      vn: '',
      sc: 'Erpv3',
      companyId: 'testCompanyId'
    }
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位驗證', () => {
    test('[400:11102] 公司ID空白', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, { companyId: '' });
      Base.verifyError(res, 11102, '公司ID空白')
      done();
    });
    test('[400:10025] 月空白', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.d = '20';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);
      Base.verifyError(res, 10025, '月空白')
      done();
    });
    test('[400:10024] 年空白', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.d = '20';
      _query.m = '12';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);
      Base.verifyError(res, 10024, '年空白')
      done();
    });
    test('[400:20033] 日不符合規則', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.d = '33';
      _query.m = '12';
      _query.y = '2022';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);
      Base.verifyError(res, 20033, '日不符合規則')
      done();
    });
    test('[400:20018] 月不符合規則', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.d = '20';
      _query.m = '40';
      _query.y = '2022';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);
      Base.verifyError(res, 20018, '月不符合規則')
      done();
    });
    test('[400:20017] 年不符合規則', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.d = '20';
      _query.m = '12';
      _query.y = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);
      Base.verifyError(res, 20017, '年不符合規則')
      done();
    });
    test('[400:20023] 日期格式有誤', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.d = '31';
      _query.m = '2';
      _query.y = '2022';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);
      Base.verifyError(res, 20023, '日期格式有誤')
      done();
    });
    test('[400:20108] 任職狀態資料有誤', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.employeeStatus = 999;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);
      Base.verifyError(res, 20108, '任職狀態資料有誤')
      done();
    });
    test('[400:20110] 員工腳色資料有誤', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.r = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);
      Base.verifyError(res, 20110, '員工腳色資料有誤')
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21121] 公司不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, { companyId: 'hellokitty' });
      Base.verifyError(res, 21121, '公司不存在')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 讀取公司員工資料列表-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(3);
      done();
    });
    test('[200] 讀取公司員工資料列表+角色-成功', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.r = '11';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(2);
      done();
    });
    test('[200] 讀取公司員工資料列表+員工狀態(離職)-成功', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.employeeStatus = '0';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(1);
      done();
    });
    test('[200] 讀取公司員工資料列表+角色+時間-成功', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.y = 2022;
      _query.m = 4;
      _query.r = '11';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(2);
      done();
    });
    test('[200] 讀取公司員工資料列表+角色+時間+員工狀態(在職)-成功', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.y = 2022;
      _query.m = 3;
      _query.r = '11';
      _query.employeeStatus = 1;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(1);
      done();
    });
    test('[200] 讀取公司員工資料列表+角色+時間+員工狀態(在職)-成功', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.y = 2022;
      _query.m = 9;
      _query.r = '11';
      _query.employeeStatus = 1;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(2);
      done();
    });
  });
})
