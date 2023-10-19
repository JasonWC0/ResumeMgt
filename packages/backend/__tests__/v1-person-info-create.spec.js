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
const _= require('lodash');
const modelCodes = require('./enums/model-codes');
const customTools = require('./basic/custom-tools');
const NativeDBClient = require('./basic/native-db-client');
const testoPerson = require('./seeder/data/person.json');
const secretKeys = require('./seeder/data/encryption.keys.json')
const Base = require('./basic/basic');
const App = require('../app');

describe('創造人員資料', () => {
  const _ENDPOINT = '/main/app/api/v1/persons';
  let agent;
  let loginData;
  let personCol;
  const createData = _.cloneDeep(testoPerson.data[0]);

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();
    personCol = NativeDBClient.getCollection(modelCodes.PERSON);

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
    test('[400:10000] 總公司ID空白', async (done) => {
      const _data = _.cloneDeep(createData);
      _data.corpId = '';
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
        code: 10000,
        message: '總公司ID空白',
        result: null,
      });
      done();
    });

    test('[400:10100] 姓名空白', async (done) => {
      const _data = _.cloneDeep(createData);
      _data.name = '';
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
        code: 10100,
        message: '姓名空白',
        result: null,
      });
      done();
    });

    test('[400:10013] 檔案Id空白', async (done) => {
      const _data = _.cloneDeep(createData);
      _data.photo.id = '';
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
        code: 10013,
        message: '檔案Id空白',
        result: null,
      });
      done();
    });
  });

  describe('資料規則驗證', () => {
    const DuplicatedPerson = {
      "corpId": "6209f71974ac715080d36309",
      "name": "阿〇伯",
      "personalId": "UncleTuu",
      "valid": true,
    }
    beforeAll(async (done) => {
      const encryptDup = _.cloneDeep(DuplicatedPerson)
      encryptDup.corpId = new ObjectId(encryptDup.corpId);
      encryptDup.personalId = {
        "masked": "Uncl〇〇〇〇",
        "cipher": await customTools.encryptionWithAESCBCPKCS7(encryptDup.personalId, secretKeys.compal.key, secretKeys.compal.iv)
      }
      await personCol.insertOne(encryptDup);
      done();
    });
    
    test('[400:20000] 總公司不存在', async (done) => {
      const noCorpIdData = _.cloneDeep(createData);
      noCorpIdData.corpId = 'fakecompany';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(noCorpIdData)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20000,
        message: '總公司不存在',
        result: null,
      });
      done();
    });

    test('[400:20101] 人員已存在', async (done) => {
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(DuplicatedPerson)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20105,
        message: '人員已存在',
        result: null,
      });
      done();
    });

    test('[400:20101] 原住民身分資料有誤', async (done) => {
      const _data = _.cloneDeep(createData);
      _data.aborigines = -1;
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
        code: 20101,
        message: '原住民身分資料有誤',
        result: null,
      });
      done();
    });

    test('[400:20102] 身障類別資料有誤', async (done) => {
      const _data = _.cloneDeep(createData);
      _data.disability = -1;
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
        code: 20102,
        message: '身障類別資料有誤',
        result: null,
      });
      done();
    });

    test('[400:20115] 宗教信仰資料有誤', async (done) => {
      const _data = _.cloneDeep(createData);
      _data.belief = -1;
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
        code: 20115,
        message: '宗教信仰資料有誤',
        result: null,
      });
      done();
    });

    test('[400:20103] 教育程度資料有誤', async (done) => {
      const _data = _.cloneDeep(createData);
      _data.education = -1;
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
        code: 20103,
        message: '教育程度資料有誤',
        result: null,
      });
      done();
    });

    test('[400:20104] 語言資料有誤', async (done) => {
      const _data = _.cloneDeep(createData);
      _data.languages = [-1];
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
        code: 20104,
        message: '語言資料有誤',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[200] 創建人員資料-成功', async (done) => {
      createData.personalId = 'a128709654';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(createData)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      const { key, iv } = secretKeys['compal'];
      const oPerson = await personCol.findOne({
        'personalId.cipher': await customTools.encryptionWithAESCBCPKCS7(createData.personalId, key, iv)
      });

      expect(res.status).toBe(200);
      expect(oPerson.corpId.toString()).toBe(createData.corpId.toString());
      expect(await customTools.decryptionWithAESCBCPKCS7(oPerson.name.cipher, key, iv)).toBe(createData.name);
      expect(await customTools.decryptionWithAESCBCPKCS7(oPerson.email.cipher, key, iv)).toBe(createData.email);
      expect(await customTools.decryptionWithAESCBCPKCS7(oPerson.mobile.cipher, key, iv)).toBe(createData.mobile);
      expect(await customTools.decryptionWithAESCBCPKCS7(oPerson.personalId.cipher, key, iv)).toBe(createData.personalId);
      expect(oPerson.languages).toEqual(createData.languages);
      expect(oPerson.gender).toBe(createData.gender);
      expect(oPerson.registerPlace.others).toEqual(createData.registerPlace.others);
      expect(oPerson.photo.id).toBe(createData.photo.id);
      expect(oPerson.genogram.id).toBe(createData.genogram.id);
      expect(oPerson.ecomap.id).toBe(createData.ecomap.id);
      expect(oPerson.swot.id).toBe(createData.swot.id);
      expect(oPerson.__vn).toBe(0);
      expect(oPerson.__cc).toBe(res.body.traceId);
      expect(oPerson.__sc).toBe('Erpv3');
      done();
    });
  });
})
