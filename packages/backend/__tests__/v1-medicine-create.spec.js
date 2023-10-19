/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-medicine-create.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-08-11 10:46:46 am
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

describe('建立藥品', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/medicines';
  let agent;
  let headers;

  const data = {
    category: 0,
    companyId: testCompanyData[0]._id.toString(),
    atcCode: 'atcCode123',
    licenseCode: '987654321',
    chineseName: '測試藥',
    englishName: 'testMed',
    genericName: '',
    form: '點滴',
    doses: 1,
    doseUnit: '',
    indications: '',
    sideEffects: '腹痛',
    healthEducation: '',
    storageConditions: '',
    usageInfo: '慢慢注射',
    remark: '',
    images: [],
    isAvailable: true,
  }
  const data2 = {
    category: 1,
    companyId: testCompanyData[0]._id.toString(),
    sharedMedicineId: '8888',
    drugCode: 'BC22543101',
    atcCode: 'atcCode123',
    licenseCode: '987654321',
    chineseName: '健保藥',
    englishName: 'testMed',
    genericName: '',
    form: '點滴',
    doses: 1,
    doseUnit: '',
    indications: '',
    sideEffects: '腹痛',
    healthEducation: '',
    storageConditions: '',
    usageInfo: '慢慢注射',
    remark: '',
    images: [],
    isAvailable: true,
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

    const medData = [{
      companyId: new ObjectId(testCompanyData[0]._id),
      drugCode: 'BC22543100',
      category: 0,
      drugCode: 'C_00000000',
      atcCode: 'xxx',
      licenseCode: '987654321',
      chineseName: '',
      englishName: '',
      genericName: '',
      indications: '',
      sideEffects: '',
      form: '',
      doses: 0,
      doseUnit: '',
      storageConditions: '',
      healthEducation: '',
      usageInfo: '',
      remark: '',
      images: [],
      isAvailable: true,
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    },{
      companyId: new ObjectId(testCompanyData[0]._id),
      sharedMedicineId: '9999',
      category: 1,
      drugCode: 'BC22543100',
      atcCode: 'N05AH04',
      licenseCode: '123456789',
      chineseName: '思樂康膜衣錠２５公絲',
      englishName: 'SEROQUEL TABLETS 25MG',
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
    await customMedicineCol.insertMany(medData);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:11202] (藥品/藥品資料庫)類型，不存在', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.category = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11202, '(藥品/藥品資料庫)類型，不存在')
      done();
    });
    test('[400:11102] 公司ID空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.companyId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11102, '公司ID空白')
      done();
    });
    test('[400:11201] 中文藥名空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.chineseName = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11201, '中文藥名空白')
      done();
    });
    test('[400:11203] 英文藥名空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.englishName = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11203, '英文藥名空白')
      done();
    });
    test('[400:21204] 藥品劑量格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.doses = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21204, '藥品劑量格式有誤')
      done();
    });
    test('[400:11200] 共用藥品資料庫藥品Id空白', async (done) => {
      const _data = lodash.cloneDeep(data2);
      _data.sharedMedicineId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11200, '共用藥品資料庫藥品Id空白')
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21207] 藥品代碼已存在自訂藥品', async (done) => {
      const _data = lodash.cloneDeep(data2);
      _data.drugCode = 'BC22543100';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21207, '藥品代碼已存在自訂藥品')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 建立藥品-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      expect(res.status).toBe(200);

      const customMedicineCol = NativeDBClient.getCollection(modelCodes.CUSTOMMEDICINE);
      const medRes = await customMedicineCol.findOne({ _id: ObjectId(res.body.result.id) });

      expect(medRes.category).toBe(data.category);
      expect(medRes.companyId.toString()).toBe(data.companyId);
      expect(medRes.drugCode).toBe('C_00000001');
      expect(medRes.atcCode).toBe(data.atcCode);
      expect(medRes.licenseCode).toBe(data.licenseCode);
      expect(medRes.chineseName).toBe(data.chineseName);
      expect(medRes.englishName).toBe(data.englishName);
      expect(medRes.form).toBe(data.form);
      expect(medRes.doses).toBe(data.doses);
      expect(medRes.sideEffects).toBe(data.sideEffects);
      expect(medRes.usageInfo).toBe(data.usageInfo);
      expect(medRes.isAvailable).toBe(data.isAvailable);
      done();
    });
    test('[200] 建立藥品(健保藥)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data2);
      expect(res.status).toBe(200);

      const customMedicineCol = NativeDBClient.getCollection(modelCodes.CUSTOMMEDICINE);
      const medRes = await customMedicineCol.findOne({ _id: ObjectId(res.body.result.id) });

      expect(medRes.category).toBe(data2.category);
      expect(medRes.companyId.toString()).toBe(data2.companyId);
      expect(medRes.sharedMedicineId).toBe(data2.sharedMedicineId);
      expect(medRes.drugCode).toBe(data2.drugCode);
      expect(medRes.atcCode).toBe(data2.atcCode);
      expect(medRes.licenseCode).toBe(data2.licenseCode);
      expect(medRes.chineseName).toBe(data2.chineseName);
      expect(medRes.englishName).toBe(data2.englishName);
      expect(medRes.form).toBe(data2.form);
      expect(medRes.doses).toBe(data2.doses);
      expect(medRes.sideEffects).toBe(data2.sideEffects);
      expect(medRes.usageInfo).toBe(data2.usageInfo);
      expect(medRes.isAvailable).toBe(data2.isAvailable);
      done();
    });
  });
});
