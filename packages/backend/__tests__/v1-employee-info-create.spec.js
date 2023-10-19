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
const _ = require('lodash');
const modelCodes = require('./enums/model-codes');
const customTools = require('./basic/custom-tools');
const NativeDBClient = require('./basic/native-db-client');
const testData = require('./seeder/data/employee.json');
const corpData = require('./seeder/data/corporation.json');
const companyData = require('./seeder/data/company.json');
const roleData = require('./seeder/data/role-default-service.json');
const Base = require('./basic/basic');
const App = require('../app');
const { KeyCloakClient } = require('@erpv3/app-common/shared/connection-clients');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');

describe('創建員工資訊', () => {
  let agent;
  let loginData;
  let personCol;
  let insertCompanyData;
  const personData = testData.person[0];
  personData._id = '626ba8bc9f06de310497eb04';
  let _ENDPOINT = `/main/app/api/v1/employees`;
  const employeeObj = {
    'account': 'testAccount',
    'startDate': '2022/02/20',
    'endDate': '',
    'contact': {
      'name': '黃虎',
      'mobile': '0937000111',
      'phoneH': '02-25232649',
      'relationship': '兒子',
    },
    'companyId': '6209f7102dde25cae862482d',
    'employeeNum': 'A001',
    'roles': [0],
    'employmentType': 1,
    'employeeCategory': '打工',
    'centralGovSystemAccount': 'test',
    'weekHours': 40,
    'reportingAgent': {
      'isAgent': true,
      'agentType': 1,
      'employeeAgent': '6209f7102dde25cae862482a',
    },
    'serviceRegion': ['台北市'],
    'interviewNote': '中肯',
    'supervisorId': '6209f7102dde25cae8624820',
    'supervisor2Id': '6209f7102dde25cae8624821',
    'serviceItemQualification': [0, 1],
    'salarySystem': 1,
  }

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();

    const companyCol = NativeDBClient.getCollection(modelCodes.COMPANY);
    insertCompanyData = companyData.data[0];
    insertCompanyData._id = ObjectId(insertCompanyData._id);
    let Company2 = _.cloneDeep(insertCompanyData);
    Company2._id = ObjectId('6209f7102dde25cae862482e');
    Company2.shortName = 'compalTest2';
    Company2.code = 'compalTest2';
    await companyCol.insertMany([insertCompanyData, Company2]);
    
    const corpCol = NativeDBClient.getCollection(modelCodes.CORPORATION);
    const corp = corpData.data[0];
    corp._id = ObjectId(corp._id)
    await corpCol.insertOne(corp);
    const keys = await fsExtra.readJson(corp.__enc.provider);
    const serectKey = keys[corp.__enc.keyId];
    personData._id = ObjectId(personData._id);
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
    personCol = NativeDBClient.getCollection(modelCodes.PERSON);
    await personCol.insertOne(personData);
    const oPerson = await personCol.findOne({});
    _ENDPOINT = _ENDPOINT + `/${oPerson._id}`

    const RoleAuthorizationCol = NativeDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
    roleData.data[0].companyId = ObjectId(insertCompanyData._id);
    await RoleAuthorizationCol.insertOne(roleData.data[0]);

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

  describe('需求欄位驗證', () => {
    test('[400:10100] 員工到職日期空白', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      _data.startDate = '';
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
        code: 10106,
        message: '員工到職日期空白',
        result: null,
      });
      done();
    });

    test('[400:10102] 員工腳色列表空白', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      delete _data.roles;
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
        code: 10103,
        message: '員工腳色列表空白',
        result: null,
      });
      done();
    });

    test('[400:11102] 公司ID空白', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      delete _data.companyId;
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
        code: 11102,
        message: '公司ID空白',
        result: null,
      });
      done();
    });

    test('[400:10101] 申報代理人類別空白', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      delete _data.reportingAgent;
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
        code: 10105,
        message: '申報代理人類別空白',
        result: null,
      });
      done();
    });

    test('[400:20015] 帳號不符合規則，特殊符號只允許@、.及_', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      _data.account = 'test===';
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
        code: 20015,
        message: '帳號不符合規則',
        result: null,
      });
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21121] 公司不存在', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      _data.companyId = '3345678';
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
        code: 21121,
        message: '公司不存在',
        result: null,
      });
      done();
    });

    test('[400:20111] 員工資料已存在此公司', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      _data.companyId = testData.person[0].employee.comPersonMgmt[0].companyId;
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
        code: 20111,
        message: '員工資料已存在此公司',
        result: null,
      });
      done();
    });

    test('[400:20102] 員工到職日期空白', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      _data.startDate = '';
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
        code: 10106,
        message: '員工到職日期空白',
        result: null,
      });
      done();
    });

    test('[400:20110] 員工腳色資料有誤', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      _data.roles = [100];
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
        code: 20110,
        message: '員工腳色資料有誤',
        result: null,
      });
      done();
    });

    test('[400:20109] 職務類別資料有誤', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      _data.employmentType = 100;
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
        code: 20109,
        message: '職務類別資料有誤',
        result: null,
      });
      done();
    });

    test('[400:20104] 員工分類不存在', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      _data.employeeCategory = '茶水小弟';
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
        code: 20122,
        message: '員工分類不存在',
        result: null,
      });
      done();
    });

    test('[400:20120] 服務項目課程代碼錯誤', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      _data.serviceItemQualification = [-1];
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
        code: 20121,
        message: '服務項目課程代碼錯誤',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[200] 創建員工資訊-成功', async (done) => {
      KeyCloakClient.adminLogin.mockResolvedValue({ access_token: '' });
      KeyCloakClient.createUser.mockResolvedValue({});
      KeyCloakClient.readUserByUsername.mockResolvedValue([{ id:'keycloakId' }]);
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(employeeObj)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: insertCompanyData._id,
        });

      expect(res.status).toBe(200);
      const oPerson = await personCol.findOne({});
      expect(oPerson.employee.contact.name).toBe(employeeObj.contact.name);
      expect(oPerson.employee.comPersonMgmt[0].employeeNum).toBe(employeeObj.employeeNum);
      expect(oPerson.employee.serviceItemQualification).toMatchObject(employeeObj.serviceItemQualification);
      expect(oPerson.employee.comPersonMgmt[0].employeeCategory).toBe(employeeObj.employeeCategory);
      expect(oPerson.employee.comPersonMgmt[0].salarySystem).toBe(employeeObj.salarySystem);
      const col = NativeDBClient.getCollection(modelCodes.ACCOUNT);
      const accountRes = await col.findOne({ account: employeeObj.account.toLowerCase() });
      expect(accountRes).toBeTruthy();
      done();
    });
  });
})
