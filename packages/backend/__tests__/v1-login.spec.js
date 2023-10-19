/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-login.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-03-28 09:58:15 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const fsExtra = require('fs-extra');
const { ObjectId } = require('mongodb');
const { KeyCloakClient } = require('@erpv3/app-common/shared/connection-clients');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const customTools = require('./basic/custom-tools');
const testAccountData = require('./seeder/data/account.json').data;
const testCorpData = require('./seeder/data/corporation.json').data;
const testRoleAuthorization = require('./seeder/data/role-authorization.json').data;
const testPersonEmployee = require('./seeder/data/employee.json').person;
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');

describe('登入', () => {
  const _ENDPOINT = '/main/app/api/v1/login';
  let agent;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);

    const companyCol = NativeDBClient.getCollection(modelCodes.COMPANY);
    const companyData = [{
      _id: ObjectId('6209f7102dde25cae862482e'),
      fullName: 'test1',
      shortName: 'testShort1',
      code: 'testShort1',
      cityCode: "a",
      service: ['ACM', 'DC'],
      systemSetting: {
        serviceItemBA02Unit: 1
      },
      pageAuth: testCompanyData[0].pageAuth,
      valid: true,
    }, {
      _id: ObjectId('6209f7102dde25cae862482f'),
      fullName: 'test1',
      shortName: 'testShort2',
      code: 'testShort2',
      cityCode: "a",
      service: ['ACM', 'DC', 'RC'],
      systemSetting: {
        serviceItemBA02Unit: 1
      },
      pageAuth: testCompanyData[0].pageAuth,
      valid: true,
    }];
    await companyCol.insertMany(companyData);

    const accountCol = NativeDBClient.getCollection(modelCodes.ACCOUNT);
    testAccountData.forEach((data) => {
      data.personId = ObjectId(data.personId);
      data.corpId = ObjectId(data.corpId);
    })
    await accountCol.insertMany(testAccountData);
    
    const corp = testCorpData[0];
    const keys = await fsExtra.readJson(corp.__enc.provider);
    const secretKey = keys[corp.__enc.keyId];
    const empCol = NativeDBClient.getCollection(modelCodes.PERSON);
    await Promise.all(testPersonEmployee.map(async (data, index) => {
      testPersonEmployee[index]._id = ObjectId(data._id);
      testPersonEmployee[index].corpId = ObjectId(data.corpId);
      testPersonEmployee[index].name = { cipher: await customTools.encryptionWithAESCBCPKCS7(data.name, secretKey.key, secretKey.iv) };
      testPersonEmployee[index].email = { cipher: await customTools.encryptionWithAESCBCPKCS7(data.email, secretKey.key, secretKey.iv) };
      testPersonEmployee[index].mobile = { cipher: await customTools.encryptionWithAESCBCPKCS7(data.mobile, secretKey.key, secretKey.iv) };
      testPersonEmployee[index].personalId = { cipher: await customTools.encryptionWithAESCBCPKCS7(data.personalId, secretKey.key, secretKey.iv) };
      data.employee.comPersonMgmt.forEach((emp, _index) => {
        testPersonEmployee[index].employee.comPersonMgmt[_index].companyId = ObjectId(emp.companyId);
        testPersonEmployee[index].employee.comPersonMgmt[_index].startDate = emp.startDate ? new Date(emp.startDate) : null;
        testPersonEmployee[index].employee.comPersonMgmt[_index].endDate = emp.endDate ? new Date(emp.endDate) : null;
      });
    }))
    await empCol.insertMany(testPersonEmployee);

    const tokenCol = NativeDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
    testRoleAuthorization[0].companyId = ObjectId(testRoleAuthorization[0].companyId);
    testRoleAuthorization[1].companyId = ObjectId(testRoleAuthorization[1].companyId);
    await tokenCol.insertMany(testRoleAuthorization);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:10011] 帳號空白', async (done) => {
      const data = {
        account: '',
        pwd: 'test'
      }
      const res = await agent.post(`${_ENDPOINT}`).send(data);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10011,
        message: '帳號空白',
        result: null,
      });
      done();
    });
    test('[400:10012] 密碼空白', async (done) => {
      const data = {
        account: 'test',
        pwd: ''
      }
      const res = await agent.post(`${_ENDPOINT}`).send(data);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10012,
        message: '密碼空白',
        result: null,
      });
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[401:90006] 帳號不在keycloak', async (done) => {
      const data = {
        account: 'test',
        pwd: 'test'
      }
      KeyCloakClient.userLogin.mockResolvedValue(null);
      const res = await agent.post(`${_ENDPOINT}`).send(data);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 90006,
        message: 'Unauthorization.',
        result: null,
      });
      done();
    });
    test('[401:90006] 帳號不在db', async (done) => {
      const data = {
        account: 'test',
        pwd: 'test'
      }
      KeyCloakClient.userLogin.mockResolvedValue({});
      const res = await agent.post(`${_ENDPOINT}`).send(data);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 90006,
        message: 'Unauthorization.',
        result: null,
      });
      done();
    });
    test('[401:90006] 無登入權限', async (done) => {
      const data = {
        account: 'nurse2',
        pwd: 'test'
      }
      KeyCloakClient.userLogin.mockResolvedValue({});
      const res = await agent.post(`${_ENDPOINT}`).send(data);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 90006,
        message: 'Unauthorization.',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    beforeAll(async (done) => {
      await Base.prepareLoginData();
      done();
    });

    test('[200] 登入-成功', async (done) => {
      const data = {
        account: 'admin',
        pwd: '12345678'
      }
      KeyCloakClient.userLogin.mockResolvedValue({});
      const res = await agent.post(`${_ENDPOINT}`).send(data);

      const tokenCol = NativeDBClient.getCollection(modelCodes.TOKEN);
      const tokenRes = await tokenCol.findOne({ account: data.account });

      expect(res.status).toBe(200);
      expect(res.body.result.token).toBeDefined();
      expect(res.body.result.id).toBeDefined();
      expect(res.body.result.token).toBe(tokenRes.token);
      expect(res.body.result.id).toBe(tokenRes._id.toString());
      done();
    });

    test('[200] 登入部分公司有權限-成功', async (done) => {
      const data = {
        account: 'nurse1',
        pwd: '12345678'
      }
      KeyCloakClient.userLogin.mockResolvedValue({});
      const res = await agent.post(`${_ENDPOINT}`).send(data);

      const tokenCol = NativeDBClient.getCollection(modelCodes.TOKEN);
      const tokenRes = await tokenCol.findOne({ account: data.account });

      expect(res.status).toBe(200);
      expect(res.body.result.token).toBeDefined();
      expect(res.body.result.id).toBeDefined();
      expect(res.body.result.token).toBe(tokenRes.token);
      expect(res.body.result.id).toBe(tokenRes._id.toString());
      expect(Object.keys(tokenRes.companies).length).toBe(1);
      done();
    });
  });
});
