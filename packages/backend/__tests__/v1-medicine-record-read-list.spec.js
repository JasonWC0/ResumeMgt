/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-medicine-record-read-list.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-08-24 11:29:13 am
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

describe('取得用藥提醒紀錄列表', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/medicineRecords';
  const caseId = new ObjectId().toString();
  let agent;
  let headers;
  let medData;
  let medRecordData;

  const query = {
    companyId: testCompanyData[0]._id.toString(),
    dType: 0,
    f: '2022/05/01',
    e: '2022/05/30'
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

    medData = [{
      _id: new ObjectId(),
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
      usageInfo: '',
      remark: '',
      images: [],
      isAvailable: true,
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    },{
      _id: new ObjectId(),
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
    const medPlanData = [{
      _id: new ObjectId(),
      companyId: new ObjectId(testCompanyData[0]._id),
      caseId: new ObjectId(caseId),
      caseName: '個案姓名',
      planName: '個案姓名-寶寶醫院-王醫師-2022/05/15-2022/05/20',
      workerId: new ObjectId(),
      workerName: '施藥人姓名',
      hospital: '寶寶醫院',
      doctor: '王醫師',
      planStartDate: new Date('2022/05/15'),
      planEndDate: new Date('2022/05/20'),
      medicines: [{
        medicineId: new ObjectId(medData[0]._id),
        quantityOfMedUse: '1,1/2',
        useFreq: {
          type: 2,
          content: [1, 4],
        },
        useTiming: {
          type: 0,
          content: [1, 2]
        }
      }],
      remark: '備註',
      images: [],
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    }]
    medRecordData = [{
      companyId: medPlanData[0].companyId,
      planId: medPlanData[0]._id,
      planName: medPlanData[0].planName,
      planStartDate: medPlanData[0].planStartDate,
      planEndDate: medPlanData[0].planEndDate,
      expectedUseTiming: {
        type: 0,
        content: 1,
      },
      expectedUseAt: new Date('2022/05/15 08:45:00'),
      caseId: medPlanData[0].caseId,
      caseName: medPlanData[0].caseName,
      workerId: medPlanData[0].workerId,
      workerName: medPlanData[0].workerName,
      status: 0,
      medicines: [{
        medicineId: medPlanData[0].medicines[0].medicineId,
        drugCode: medData[0].drugCode,
        atcCode: medData[0].atcCode,
        chineseName: medData[0].chineseName,
        englishName: medData[0].englishName,
        indications: medData[0].indications,
        usageInfo: medData[0].usageInfo,
        form: medData[0].form,
        doses: medData[0].doses,
        doseUnit: medData[0].doseUnit,
        quantityOfMedUse: medPlanData[0].medicines[0].quantityOfMedUse,
        useFreq: medPlanData[0].medicines[0].useFreq,
        useTiming: medPlanData[0].medicines[0].useTiming,
        isUsed: false,
      }],
      remark: '',
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    }, {
      companyId: medPlanData[0].companyId,
      planId: medPlanData[0]._id,
      planName: medPlanData[0].planName,
      planStartDate: medPlanData[0].planStartDate,
      planEndDate: medPlanData[0].planEndDate,
      expectedUseTiming: {
        type: 0,
        content: 2,
      },
      expectedUseAt: new Date('2022/05/15 11:45:00'),
      caseId: medPlanData[0].caseId,
      caseName: medPlanData[0].caseName,
      workerId: medPlanData[0].workerId,
      workerName: medPlanData[0].workerName,
      status: 0,
      medicines: [{
        medicineId: medPlanData[0].medicines[0].medicineId,
        drugCode: medData[0].drugCode,
        atcCode: medData[0].atcCode,
        chineseName: medData[0].chineseName,
        englishName: medData[0].englishName,
        indications: medData[0].indications,
        usageInfo: medData[0].usageInfo,
        form: medData[0].form,
        doses: medData[0].doses,
        doseUnit: medData[0].doseUnit,
        quantityOfMedUse: medPlanData[0].medicines[0].quantityOfMedUse,
        useFreq: medPlanData[0].medicines[0].useFreq,
        useTiming: medPlanData[0].medicines[0].useTiming,
        isUsed: false,
      }],
      remark: '',
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    }];
    const customMedicineCol = NativeDBClient.getCollection(modelCodes.CUSTOMMEDICINE);
    await customMedicineCol.insertMany(medData);
    const medPlanCol = NativeDBClient.getCollection(modelCodes.MEDICINEPLAN);
    await medPlanCol.insertMany(medPlanData);
    const medRecordCol = NativeDBClient.getCollection(modelCodes.MEDICINERECORD);
    await medRecordCol.insertMany(medRecordData);
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
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);
      Base.verifyError(res, 11102, '公司ID空白')
      done();
    });
    test('[400:21213] 搜尋日期條件類型不存在', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.dType = 999;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);
      Base.verifyError(res, 21213, '搜尋日期條件類型不存在')
      done();
    });
    test('[400:10019] 開始日期空白', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.f = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);
      Base.verifyError(res, 10019, '開始日期空白')
      done();
    });
    test('[400:10020] 結束日期空白', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.e = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);
      Base.verifyError(res, 10020, '結束日期空白')
      done();
    });
    test('[400:20009] 開始日期格式有誤', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.f = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);
      Base.verifyError(res, 20009, '開始日期格式有誤')
      done();
    });
    test('[400:20010] 結束日期格式有誤', async (done) => {
      const _query = lodash.cloneDeep(query);
      _query.e = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _query);
      Base.verifyError(res, 20010, '結束日期格式有誤')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 取得用藥提醒紀錄列表-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(2);
      done();
    });
  });
});
