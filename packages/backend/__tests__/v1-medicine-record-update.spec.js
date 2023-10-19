/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-medicine-record-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-08-24 11:29:41 am
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

describe('更新用藥提醒紀錄', () => {
  const METHOD = 'PATCH';
  const _ENDPOINT = '/main/app/api/v1/medicineRecords';
  const caseId = new ObjectId().toString();
  let agent;
  let headers;
  let medData;
  let medRecordData;

  const data = {
    actualUseAt: '2022/05/15 09:00:00',
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
      },
      {
        medicineId: new ObjectId(medData[1]._id),
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
      _id: new ObjectId(),
      companyId: medPlanData[0].companyId,
      planId: medPlanData[0]._id,
      planName: medPlanData[0].planName,
      planStartDate: medPlanData[0].planStartDate,
      planEndDate: medPlanData[0].planEndDate,
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
      }, {
        medicineId: medPlanData[0].medicines[1].medicineId,
        drugCode: medData[1].drugCode,
        atcCode: medData[1].atcCode,
        chineseName: medData[1].chineseName,
        englishName: medData[1].englishName,
        indications: medData[1].indications,
        usageInfo: medData[1].usageInfo,
        form: medData[1].form,
        doses: medData[1].doses,
        doseUnit: medData[1].doseUnit,
        quantityOfMedUse: medPlanData[0].medicines[1].quantityOfMedUse,
        useFreq: medPlanData[0].medicines[1].useFreq,
        useTiming: medPlanData[0].medicines[1].useTiming,
        isUsed: false,
      }],
      remark: '',
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    }, {
      _id: new ObjectId(),
      companyId: medPlanData[0].companyId,
      planId: medPlanData[0]._id,
      planName: medPlanData[0].planName,
      planStartDate: medPlanData[0].planStartDate,
      planEndDate: medPlanData[0].planEndDate,
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
      }, {
        medicineId: medPlanData[0].medicines[1].medicineId,
        drugCode: medData[1].drugCode,
        atcCode: medData[1].atcCode,
        chineseName: medData[1].chineseName,
        englishName: medData[1].englishName,
        indications: medData[1].indications,
        usageInfo: medData[1].usageInfo,
        form: medData[1].form,
        doses: medData[1].doses,
        doseUnit: medData[1].doseUnit,
        quantityOfMedUse: medPlanData[0].medicines[1].quantityOfMedUse,
        useFreq: medPlanData[0].medicines[1].useFreq,
        useTiming: medPlanData[0].medicines[1].useTiming,
        isUsed: false,
      }],
      remark: '',
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    }];
    data.workerId = medRecordData[0].workerId;
    data.workerName = '施藥者姓名';
    data.medicines = [{
      medicineId: medRecordData[0].medicines[0].medicineId,
      isUsed: true,
    }, {
      medicineId: medRecordData[0].medicines[1].medicineId,
      isUsed: false,
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
    test('[400:11208] 施藥人Id空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.workerId = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medRecordData[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 11208, '施藥人Id空白')
      done();
    });
    test('[400:11209] 施藥人姓名空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.workerName = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medRecordData[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 11209, '施藥人姓名空白')
      done();
    });
    test('[400:11211] 實際用藥日期時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.actualUseAt = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medRecordData[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 11211, '實際用藥日期時間空白')
      done();
    });
    test('[400:21216] 實際用藥日期時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.actualUseAt = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medRecordData[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 21216, '實際用藥日期時間格式有誤')
      done();
    });
    test('[400:11212] 用藥提醒紀錄藥品列表空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines = [];
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medRecordData[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 11212, '用藥提醒紀錄藥品列表空白')
      done();
    });
    test('[400:11205] 藥品Id空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].medicineId = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medRecordData[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 11205, '藥品Id空白')
      done();
    });
    test('[400:21217] 藥品是否使用格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].isUsed = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medRecordData[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 21217, '藥品是否使用格式有誤')
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21215] 用藥紀錄不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/test`, headers, data);
      Base.verifyError(res, 21215, '用藥紀錄不存在')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 更新用藥提醒紀錄-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medRecordData[0]._id.toString()}`, headers, data);

      const medRecordCol = NativeDBClient.getCollection(modelCodes.MEDICINERECORD);
      const recordData = await medRecordCol.findOne({ _id: medRecordData[0]._id });

      expect(res.status).toBe(200);
      expect(new Date(recordData.actualUseAt)).toEqual(new Date(data.actualUseAt));
      expect(recordData.status).toBe(3);
      expect(recordData.workerId.toString()).toBe(data.workerId.toString());
      expect(recordData.workerName).toBe(data.workerName);
      expect(recordData.medicines[0].isUsed).toBe(data.medicines[0].isUsed);
      expect(recordData.medicines[1].isUsed).toBe(data.medicines[1].isUsed);
      done();
    });
    test('[200] 更新用藥提醒紀錄-成功', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines = [{
        medicineId: medRecordData[1].medicines[0].medicineId,
        isUsed: true,
      }, {
        medicineId: medRecordData[1].medicines[1].medicineId,
        isUsed: true,
      }];
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medRecordData[1]._id.toString()}`, headers, _data);

      const medRecordCol = NativeDBClient.getCollection(modelCodes.MEDICINERECORD);
      const recordData = await medRecordCol.findOne({ _id: medRecordData[1]._id });

      expect(res.status).toBe(200);
      expect(new Date(recordData.actualUseAt)).toEqual(new Date(_data.actualUseAt));
      expect(recordData.status).toBe(2);
      expect(recordData.workerId.toString()).toBe(_data.workerId.toString());
      expect(recordData.workerName).toBe(_data.workerName);
      expect(recordData.medicines[0].isUsed).toBe(_data.medicines[0].isUsed);
      expect(recordData.medicines[1].isUsed).toBe(_data.medicines[1].isUsed);
      done();
    });
  });
});
