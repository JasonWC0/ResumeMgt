/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-medicine-read-list.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-08-10 05:40:36 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('取得藥品列表', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/medicines';
  let agent;
  let headers;
  let data;

  const query = {
    companyId: testCompanyData[0]._id.toString(),
    skip: 0,
    limit: 10
  }

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    const loginData = await Base.login(agent);
    headers = {
      Authorization: `Bearer ${loginData.token}`,
      vn: 0,
      sc: 'Erpv3',
      companyId: testCompanyData[0]._id
    }

    data = [{
      companyId: new ObjectId(testCompanyData[0]._id),
      category: 0,
      drugCode: 'C_00000000',
      atcCode: 'xxx',
      licenseCode: '987654321',
      chineseName: '中文名稱',
      englishName: 'english1',
      genericName: '',
      indications: '',
      sideEffects: '',
      form: '',
      doses: 0,
      doseUnit: '',
      storageConditions: '',
      healthEducation: '',
      usageInfo: '資訊',
      remark: '',
      images: [],
      isAvailable: true,
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    },{
      companyId: new ObjectId(testCompanyData[0]._id),
      category: 1,
      drugCode: 'BC22543100',
      atcCode: 'N05AH04',
      licenseCode: '123456789',
      chineseName: '思樂康膜衣錠２５公絲',
      englishName: 'SEROQUEL TABLETS',
      genericName: '',
      indications: '',
      sideEffects: '',
      form: '',
      doses: 1,
      doseUnit: '膜衣錠',
      storageConditions: '',
      healthEducation: '',
      usageInfo: '',
      remark: '',
      images: [],
      isAvailable: true,
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    }];
    const customMedicineCol = NativeDBClient.getCollection(modelCodes.CUSTOMMEDICINE);
    await customMedicineCol.insertMany(data);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:11102] 公司ID空白', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.companyId = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/custom`, headers, {}, _query);
      Base.verifyError(res, 11102, '公司ID空白')
      done();
    });
    test('[400:10008] 略過筆數空白', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.skip = null;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/custom`, headers, {}, _query);
      Base.verifyError(res, 10008, '略過筆數空白')
      done();
    });
    test('[400:10009] 取得筆數空白', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.limit = null;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/custom`, headers, {}, _query);
      Base.verifyError(res, 10009, '取得筆數空白')
      done();
    });
    test('[400:11202] (藥品/藥品資料庫)類型，不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/test`, headers, {}, query);
      Base.verifyError(res, 11202, '(藥品/藥品資料庫)類型，不存在')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 取得藥品列表-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/custom`, headers, {}, query);

      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(2);
      expect(res.body.result.data).toHaveLength(2);
      expect(res.body.result.data[0].drugCode).toBe(data[0].drugCode);
      expect(res.body.result.data[0].usageInfo).toBe(data[0].usageInfo);
      done();
    });
    test('[200] 取得藥品列表-成功(set order)', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.order = 'drugCode';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/custom`, headers, {}, _query);

      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(2);
      expect(res.body.result.data).toHaveLength(2);
      expect(res.body.result.data[0].drugCode).toBe(data[1].drugCode);
      done();
    });
    test('[200] 取得藥品列表-成功(set limit)', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.limit = 1;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/custom`, headers, {}, _query);

      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(2);
      expect(res.body.result.data).toHaveLength(1);
      expect(res.body.result.data[0].drugCode).toBe(data[0].drugCode);
      done();
    });
    test('[200] 取得藥品列表-成功(set category)', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.limit = 1;
      _query.category = 0;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/custom`, headers, {}, _query);

      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(1);
      expect(res.body.result.data).toHaveLength(1);
      expect(res.body.result.data[0].drugCode).toBe(data[0].drugCode);
      done();
    });
    test('[200] 取得藥品列表-成功(set englishName)', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.limit = 1;
      _query.englishName = 'seroquel';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/custom`, headers, {}, _query);

      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(1);
      expect(res.body.result.data).toHaveLength(1);
      expect(res.body.result.data[0].drugCode).toBe(data[1].drugCode);
      done();
    });
  });
});