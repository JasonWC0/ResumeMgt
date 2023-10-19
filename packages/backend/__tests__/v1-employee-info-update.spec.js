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
const roleData = require('./seeder/data/role-default-service.json');
const { KeyCloakClient } = require('@erpv3/app-common/shared/connection-clients');
const ObjectID = require('mongodb').ObjectID;

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');

describe('更新員工資料', () => {
  let agent;
  let loginData;
  let personCol;
  let insertCompanyData;
  const personData = testData.person[0];
  const personData2 = testData.person[1];
  let _ENDPOINT = `/main/app/api/v1/employees`;
  const employeeObj = {
    'account': 'testAccount',
    'employeeStatus': 1,
    'startDate': '2022/02/20',
    'contact': {
      'name': '黃虎',
      'mobile': '0937000111',
      'phoneH': '02-25232649',
      'relationship': '兒子',
    },
    'companyId':  companyData.data[0]._id,
    'employeeNum': 'A001',
    'roles': [0],
    'employmentType': 1,
    'employeeCategory': '打工',
    'centralGovSystemAccount': 'test',
    'weekHours': 40,
    'reportingAgent': {
      'isAgent': true,
      'agentType': 1,
      'employeeAgent': '6209f7102dde25cae862482c',
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
    insertCompanyData._id = ObjectID(insertCompanyData._id);
    let Company2 = _.cloneDeep(insertCompanyData);
    Company2._id = ObjectID('6209f7102dde25cae862482e');
    Company2.shortName = 'compalTest2';
    Company2.code = 'compalTest2';
    await companyCol.insertMany([insertCompanyData, Company2]);

    personCol = NativeDBClient.getCollection(modelCodes.PERSON);
    personData._id = ObjectID(personData._id);
    personData.employee.comPersonMgmt[0].companyId = companyData.data[0]._id;
    await personCol.insertOne(personData);
    personData2._id = ObjectID(personData2._id);
    await personCol.insertOne(personData2);

    const RoleAuthorizationCol = NativeDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
    roleData.data[0].companyId = ObjectID(insertCompanyData._id);
    await RoleAuthorizationCol.insertOne(roleData.data[0]);

    const accountCol = NativeDBClient.getCollection(modelCodes.ACCOUNT);
    await accountCol.insertOne({
      corpId: ObjectID('6209f71974ac715080d36309'),
      personId: personData2._id,
      type: 0,
      account: 'test',
      keycloakId: '',
      companyAdmin: true,
      valid: true
    });

    agent = request.agent(new App().app);
    loginData = await Base.login(agent);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位驗證', () => {
    test('[400:11102] 公司ID空白', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      delete _data.companyId;
      const res = await agent
        .patch(`${_ENDPOINT}/${personData._id}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: personData.__vn,
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
  });

  describe('資料規則驗證', () => {
    test('[404:90008] 找不到此人員', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      const res = await agent
        .patch(`/main/app/api/v1/employees/abcdef0123456789`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: personData.__vn,
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

    test('[400:20102] 到職日期格式錯誤', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      _data.startDate = '民國101年5月1日';
      const res = await agent
        .patch(`${_ENDPOINT}/${personData._id}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: personData.__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20123,
        message: '到職日期格式錯誤',
        result: null,
      });
      done();
    });

    test('[400:20103] 員工腳色資料有誤', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      _data.roles = [100];
      const res = await agent
        .patch(`${_ENDPOINT}/${personData._id}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: personData.__vn,
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

    test('[400:20104] 職務類別資料有誤', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      _data.employmentType = 100;
      const res = await agent
        .patch(`${_ENDPOINT}/${personData._id}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: personData.__vn,
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

    test('[400:20121] 員工分類不存在', async (done) => {
      const _data = _.cloneDeep(employeeObj);
      _data.employeeCategory = '茶水小弟';
      const res = await agent
        .patch(`${_ENDPOINT}/${personData._id}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: personData.__vn,
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
        .patch(`${_ENDPOINT}/${personData._id}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: personData.__vn,
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

    test('[400:90010] 資料版號有誤(低於現有版本)', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/${personData2._id}`)
        .send(employeeObj)
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
    beforeAll( async (done) => {
      const accountCol = NativeDBClient.getCollection(modelCodes.ACCOUNT);
      await accountCol.insertOne({
        corpId: ObjectID('6209f71974ac715080d36309'),
        personId: ObjectID('6209f71974ac715080d36500'),
        type: 0,
        account: 'SuperMario',
        keycloakId: '',
        companyAdmin: true,
        valid: true
      });
      done();
    })

    test('[200] 更新員工資料-成功', async (done) => {
      KeyCloakClient.adminLogin.mockResolvedValue({ access_token: '' });
      KeyCloakClient.deleteUser.mockResolvedValue(true);
      KeyCloakClient.createUser.mockResolvedValue(true);
      KeyCloakClient.readUserByUsername.mockResolvedValue([{ id: 'fakeId'}]);

      const res = await agent
        .patch(`${_ENDPOINT}/${personData._id}`)
        .send(employeeObj)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: personData.__vn,
          sc: 'Erpv3',
          companyId: insertCompanyData._id,
        });

      expect(res.status).toBe(200);
      const updRes = await personCol.findOne({});
      expect(updRes.employee.contact.name).toBe(employeeObj.contact.name);
      expect(updRes.employee.comPersonMgmt[0].employeeNum).toBe(employeeObj.employeeNum);
      expect(updRes.employee.serviceItemQualification).toMatchObject(employeeObj.serviceItemQualification);
      expect(updRes.employee.comPersonMgmt[0].employeeCategory).toBe(employeeObj.employeeCategory);
      expect(updRes.employee.comPersonMgmt[0].salarySystem).toBe(employeeObj.salarySystem);
      expect(updRes.__vn).toBe(personData.__vn+1);
      expect(updRes.__sc).toBe('Erpv3');
      expect(updRes.__cc).toBe(res.body.traceId);
      done();
    });
  });
});
