/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-medicine-read.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-08-11 10:24:00 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('取得藥品', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/medicines';
  let agent;
  let headers;
  let data;
  let id;

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
      chineseName: '中文',
      englishName: 'mewmew',
      genericName: '',
      indications: '',
      sideEffects: '睡覺',
      form: '錠',
      doses: 3,
      doseUnit: 'pics.',
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
    await customMedicineCol.insertMany(data);
    const res = await customMedicineCol.findOne({ drugCode: data[0].drugCode });
    id = res._id.toString();
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:11202] (藥品/藥品資料庫)類型，不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/test/${id}`, headers);
      Base.verifyError(res, 11202, '(藥品/藥品資料庫)類型，不存在')
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21202] 藥品不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/custom/test`, headers);
      Base.verifyError(res, 21202, '藥品不存在')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 取得藥品-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/custom/${id}`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result.category).toBe(data[0].category);
      expect(res.body.result.drugCode).toBe(data[0].drugCode);
      expect(res.body.result.atcCode).toBe(data[0].atcCode);
      expect(res.body.result.licenseCode).toBe(data[0].licenseCode);
      expect(res.body.result.chineseName).toBe(data[0].chineseName);
      expect(res.body.result.englishName).toBe(data[0].englishName);
      expect(res.body.result.genericName).toBe(data[0].genericName);
      expect(res.body.result.indications).toBe(data[0].indications);
      expect(res.body.result.sideEffects).toBe(data[0].sideEffects);
      expect(res.body.result.form).toBe(data[0].form);
      expect(res.body.result.doses).toBe(data[0].doses);
      expect(res.body.result.doseUnit).toBe(data[0].doseUnit);
      expect(res.body.result.storageConditions).toBe(data[0].storageConditions);
      expect(res.body.result.healthEducation).toBe(data[0].healthEducation);
      expect(res.body.result.isAvailable).toBe(data[0].isAvailable);
      expect(res.body.result.vn).toBe(data[0].__vn);
      done();
    });
  });
});
