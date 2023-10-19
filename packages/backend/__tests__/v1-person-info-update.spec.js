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
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const testPersonData = require('./seeder/data/person.json');
const modelCodes = require('./enums/model-codes');


describe('更新人員資料', () => {
  let _ENDPOINT = '/main/app/api/v1/persons';
  let agent;
  let loginData;
  const createData = testPersonData.data[0];

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    _ENDPOINT = _ENDPOINT + '/' + createData._id;
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
    test('[400:10100] 姓名空白', async (done) => {
      const _data = _.cloneDeep(testPersonData.updateObj);
      _data.name = '';
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: createData.__vn,
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
      let _data = _.cloneDeep(testPersonData.updateObj);
      _data.photo.id = '';
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: createData.__vn,
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
    test('[400:20101] 原住民身分資料有誤', async (done) => {
      const _data = _.cloneDeep(testPersonData.updateObj);
      _data.aborigines = -1;
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: createData.__vn,
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
      const _data = _.cloneDeep(testPersonData.updateObj);
      _data.disability = -1;
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: createData.__vn,
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
      const _data = _.cloneDeep(testPersonData.updateObj);
      _data.belief = -1;
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: createData.__vn,
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
      const _data = _.cloneDeep(testPersonData.updateObj);
      _data.education = -1;
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: createData.__vn,
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
      const _data = _.cloneDeep(testPersonData.updateObj);
      _data.languages = [-1];
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: createData.__vn,
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

    test('[400:90010] 資料版號有誤(低於現有版本)', async (done) => {
      const updateData = {
        "name": "孫小美",
      };
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(updateData)
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
    test('[200] 更新人員資料-成功', async (done) => {
      const updateData = {
        "name": "孫小美",
      };
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send(updateData)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: createData.__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });
      const personCol = await NativeDBClient.getCollection(modelCodes.PERSON);
      const personData = await personCol.findOne({ _id: createData._id });
      expect(res.status).toBe(200);
      expect(personData.name.masked).toBe("孫〇美");
      expect(personData.registerPlace).toMatchObject(createData.registerPlace)
      expect(personData.photo).toMatchObject(createData.photo)
      expect(personData.__vn).toBe(createData.__vn+1);
      expect(personData.__cc).toBe(res.body.traceId);
      expect(personData.__sc).toBe('Erpv3');
      done();
    });
  });
})
