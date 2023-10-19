/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-medicine-plan-read.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-08-16 04:46:18 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('取得用藥計畫', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/medicinePlans';
  const caseId = new ObjectId().toString();
  let agent;
  let headers;
  let medData;
  let medPlanData;

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
      form: '點滴',
      doses: 0,
      doseUnit: '',
      storageConditions: '',
      healthEducation: '',
      usageInfo: '緩慢施打',
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
    medPlanData = [{
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
        medicineId: medData[0]._id,
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
    const customMedicineCol = NativeDBClient.getCollection(modelCodes.CUSTOMMEDICINE);
    await customMedicineCol.insertMany(medData);
    const medPlanCol = NativeDBClient.getCollection(modelCodes.MEDICINEPLAN);
    await medPlanCol.insertMany(medPlanData)
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('資料規則驗證', () => {
    test('[400:21214] 用藥計畫不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/test`, headers);
      Base.verifyError(res, 21214, '用藥計畫不存在')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 取得用藥計畫-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanData[0]._id.toString()}`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result.planName).toBe(medPlanData[0].planName);
      expect(res.body.result.caseName).toBe(medPlanData[0].caseName);
      expect(res.body.result.workerId).toBe(medPlanData[0].workerId.toString());
      expect(res.body.result.workerName).toBe(medPlanData[0].workerName);
      expect(res.body.result.hospital).toBe(medPlanData[0].hospital);
      expect(res.body.result.doctor).toBe(medPlanData[0].doctor);
      expect(res.body.result.medicines[0].medicineId).toBe(medPlanData[0].medicines[0].medicineId.toString());
      expect(res.body.result.medicines[0].drugCode).toBe(medData[0].drugCode);
      expect(res.body.result.medicines[0].atcCode).toBe(medData[0].atcCode);
      expect(res.body.result.medicines[0].chineseName).toBe(medData[0].chineseName);
      expect(res.body.result.medicines[0].englishName).toBe(medData[0].englishName);
      expect(res.body.result.medicines[0].usageInfo).toBe(medData[0].usageInfo);
      expect(res.body.result.medicines[0].indications).toBe(medData[0].indications);
      expect(res.body.result.medicines[0].form).toBe(medData[0].form);
      expect(res.body.result.medicines[0].doses).toBe(medData[0].doses);
      expect(res.body.result.medicines[0].doseUnit).toBe(medData[0].doseUnit);
      expect(res.body.result.medicines[0].isAvailable).toBe(medData[0].isAvailable);
      expect(res.body.result.medicines[0].quantityOfMedUse).toBe(medPlanData[0].medicines[0].quantityOfMedUse);
      expect(res.body.result.medicines[0].useFreq).toEqual(medPlanData[0].medicines[0].useFreq);
      expect(res.body.result.medicines[0].useTiming).toEqual(medPlanData[0].medicines[0].useTiming);
      expect(res.body.result.remark).toEqual(medPlanData[0].remark);
      done();
    });
  });
});
