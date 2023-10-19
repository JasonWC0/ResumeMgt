/**
 * FeaturePath: 經營管理-評鑑管理-逐案分析-新增公司日照評鑑表單範本列表
 * FeaturePath: 經營管理-評鑑管理-逐案分析-編輯公司日照評鑑表單範本列表
 * FeaturePath: 個案管理-評估-評估管理-新增公司評估表單範本列表
 * FeaturePath: 個案管理-評估-評估管理-編輯公司評估表單範本列表
 * Accountable: JoyceS Hsu, Wilbert Yang
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: admin-form-seeder.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-11 10:08:53 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const conf = require('@erpv3/app-common/shared/config');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testFormData = require('./seeder/data/form.json');
const Base = require('./basic/basic');
const App = require('../app');
 
describe('新增/更新，表單範本資料(批次seeder)', () => {
  const _ENDPOINT = '/main/admin/api/forms';
  let agent;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('成功', () => {
    test('[200] 更新表單範本資料(批次seeder)', async (done) => {
      const _data = lodash.cloneDeep(testFormData.data);
      _data.forEach((data) => data.__sc = 'Script')
      _data.forEach((data) => data.__vn = 3)
      const res = await agent
        .post(`${_ENDPOINT}/seeder`)
        .send({ data: _data })
        .set(`${conf.ADMIN_AUTH.KEY}`, `${conf.ADMIN_AUTH.VALUE}`)
        .set('sc', 'Script');

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(testFormData.data[0].companyId), inUse: true }).toArray();

      expect(res.status).toBe(200);
      expect(formData.length).toBe(7);
      expect(formData[0].__sc).toBe('Script');
      expect(formData[0].__vn).toBe(3);
      done();
    });

    test('[200] 新增表單範本資料(批次seeder)', async (done) => {
      const _data = [{
        serviceTypes : ['DC'],
        internalCode: '',
        reviewRoles : [],
        clientDomain : 'LUNA',
        companyId : '60e4700c87823b7810d93043',
        category : 'accreditation',
        type : 'ccper',
        version : 'v1.00',
        name : '日間照顧個案照顧計畫執行記錄表(C表)',
        reviewType : 0,
        frequency : '',
        displayGroup : '',
        fillRoles : [],
        viewRoles : [],
        signatures: [],
        inUse : true,
        valid : true,
        __vn : 0,
        __cc : '',
        __sc : 'Script'
      }, {
        serviceTypes : ['DC'],
        internalCode: '',
        reviewRoles : [],
        clientDomain : 'LUNA',
        companyId : '60e4700c87823b7810d93043',
        category : 'accreditation',
        type : 'ci',
        version : 'v1.00',
        name : '日間照顧個案基本資料表(A表)',
        reviewType : 0,
        frequency : '',
        displayGroup : '',
        fillRoles : [],
        viewRoles : [],
        signatures: [],
        inUse : true,
        valid : true,
        __vn : 0,
        __cc : '',
        __sc : 'Script'
      }];
      const res = await agent
        .post(`${_ENDPOINT}/seeder`)
        .send({ data: _data })
        .set(`${conf.ADMIN_AUTH.KEY}`, `${conf.ADMIN_AUTH.VALUE}`)
        .set('sc', 'Script');

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({ companyId: ObjectId(_data[0].companyId), inUse: true }).toArray();

      expect(res.status).toBe(200);
      expect(formData.length).toBe(2);
      expect(formData[0].__sc).toBe('Script');
      expect(formData[0].category).toBe(_data[0].category);
      done();
    });

    test('[200] 新增/更新,表單範本資料(批次seeder)', async (done) => {
      const _data = lodash.cloneDeep(testFormData.data);
      _data.forEach((data) => data.__sc = 'Script');
      _data[0].version = 'v2.0';
      _data[0].__vn = 3;
      _data.push({
        serviceTypes : ['DC'],
        internalCode: '',
        reviewRoles : [],
        clientDomain : 'LUNA',
        companyId : '5ec546eafc1e2d5e856de8f0',
        category : 'accreditation',
        type : 'cpcp',
        version : 'v1.00',
        name : '日間照顧個案需求暨個別化照顧計畫表(B表)',
        reviewType : 0,
        frequency : '',
        displayGroup : '',
        fillRoles : [],
        viewRoles : [],
        signatures: [],
        inUse : true,
        valid : true,
        __vn : 0,
        __cc : '',
        __sc : 'Script'
      });
      _data.push({
        serviceTypes : ['DC'],
        internalCode: '',
        reviewRoles : [],
        clientDomain : 'LUNA',
        companyId : '5ec546eafc1e2d5e856de8f0',
        category : 'accreditation',
        type : 'thr',
        version : 'v1.00',
        name : '小規模多機能服務臨時住宿記錄表(D表)',
        reviewType : 0,
        frequency : '',
        displayGroup : '',
        fillRoles : [],
        viewRoles : [],
        signatures: [],
        inUse : true,
        valid : true,
        __vn : 0,
        __cc : '',
        __sc : 'Script'
      });
      const res = await agent
        .post(`${_ENDPOINT}/seeder`)
        .send({ data: _data })
        .set(`${conf.ADMIN_AUTH.KEY}`, `${conf.ADMIN_AUTH.VALUE}`)
        .set('sc', 'Script');

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formDataAll = await formCol.find({}).toArray();
      const formDataInUse = await formCol.find({ inUse: true }).toArray();

      expect(res.status).toBe(200);
      expect(formDataAll.length).toBe(13);
      expect(formDataInUse.length).toBe(11);
      done();
    });

    test('[200] 更新表單範本資料(批次seeder), 版本舊無法更新', async (done) => {
      const _data = lodash.cloneDeep(testFormData.data);
      _data.forEach((data) => data.__sc = 'Script')
      const res = await agent
        .post(`${_ENDPOINT}/seeder`)
        .send({ data: _data })
        .set(`${conf.ADMIN_AUTH.KEY}`, `${conf.ADMIN_AUTH.VALUE}`)
        .set('sc', 'Script');

      const formCol = NativeDBClient.getCollection(modelCodes.FORM);
      const formData = await formCol.find({}).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.notInsert.length).toBe(7);
      expect(formData.length).toBe(14);
      done();
    });
  });
});