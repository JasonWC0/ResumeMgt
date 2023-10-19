/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-medicine-record-batch-update-scheduleStatus.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-08-31 05:59:30 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const moment = require('moment');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('班表狀態變更用藥提醒紀錄', () => {
  const METHOD = 'PATCH';
  const _ENDPOINT = '/main/app/api/v1/medicineRecords/batch/scheduleStatus';
  const caseId = new ObjectId().toString();
  const caseId2 = new ObjectId().toString();
  let agent;
  let headers;

  const sDate = moment().subtract(3, 'd').format('YYYY/MM/DD');
  const eDate = moment().add(7, 'd').format('YYYY/MM/DD');
  const leaveData = {
    caseId,
    personId: new ObjectId().toString(),
    scheduleStatus: 0,
    date: moment(sDate, 'YYYY/MM/DD').add(5, 'd').format('YYYY/MM/DD')
  };
  const cancelLeaveData = {
    caseId,
    personId: new ObjectId().toString(),
    scheduleStatus: 1,
    date: moment(sDate, 'YYYY/MM/DD').add(4, 'd').format('YYYY/MM/DD')
  };

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
      sc: 'Erpv3',
      companyId: testCompanyData[0]._id
    }

    const medData = [{
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
    const medPlanData = [
      {
        _id: new ObjectId(),
        companyId: new ObjectId(testCompanyData[0]._id.toString()),
        caseId: new ObjectId(caseId),
        caseName: '個案姓名',
        planName: `個案姓名-寶寶醫院-王醫師-${sDate}-${eDate}`,
        workerId: new ObjectId().toString(),
        workerName: '施藥人姓名',
        hospital: '寶寶醫院',
        doctor: '王醫師',
        planStartDate: new Date(sDate),
        planEndDate:  new Date(eDate),
        medicines: [{
          medicineId: medData[0]._id,
          quantityOfMedUse: '1,1/2',
          useFreq: {
            type: 1,
            content: 4,
          },
          useTiming: {
            type: 0,
            content: [1]
          }
        }, {
          medicineId: medData[1]._id,
          quantityOfMedUse: '1,1/2',
          useFreq: {
            type: 0,
            content: null,
          },
          useTiming: {
            type: 1,
            content: ['10:00']
          }
        }],
        remark: '備註',
        images: [],
        __vn: 0,
        __sc: 'TEST',
        valid: true,
      },
      {
        _id: new ObjectId(),
        companyId: new ObjectId(testCompanyData[0]._id),
        caseId: new ObjectId(caseId2),
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
        },
        {
          medicineId: medData[1]._id,
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
      }
    ]
    const medRecordData = [
      {
        companyId: medPlanData[0].companyId,
        planId: medPlanData[0]._id,
        planName: medPlanData[0].planName,
        caseId: medPlanData[0].caseId,
        caseName: medPlanData[0].caseName,
        workerId: medPlanData[0].workerId,
        workerName: medPlanData[0].workerName,
        planStartDate: medPlanData[0].planStartDate,
        planEndDate: medPlanData[0].planEndDate,
        expectedUseTiming: { type: 0, content: 1 },
        expectedUseAt: moment(sDate, 'YYYY/MM/DD').add(5, 'd').set('hour', 7).set('minute', 45).toDate(),
        actualUseAt: null,
        status: 0,
        medicines: [
        {
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
          isUsed: false
        }],
        remark: '備註',
        __sc: 'TEST',
        __vn: 0,
        valid: true,
      },
      {
        companyId: medPlanData[0].companyId,
        planId: medPlanData[0]._id,
        planName: medPlanData[0].planName,
        caseId: medPlanData[0].caseId,
        caseName: medPlanData[0].caseName,
        workerId: medPlanData[0].workerId,
        workerName: medPlanData[0].workerName,
        planStartDate: medPlanData[0].planStartDate,
        planEndDate: medPlanData[0].planEndDate,
        expectedUseTiming: { type: 1, content: '10:00' },
        expectedUseAt: moment(sDate, 'YYYY/MM/DD').add(1, 'd').set('hour', 10).set('minute', 0).toDate(),
        actualUseAt: null,
        status: 0,
        medicines: [
        {
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
          isUsed: false
        }],
        remark: '備註',
        __sc: 'TEST',
        __vn: 0,
        valid: true,
      },
      {
        companyId: medPlanData[0].companyId,
        planId: medPlanData[0]._id,
        planName: medPlanData[0].planName,
        caseId: medPlanData[0].caseId,
        caseName: medPlanData[0].caseName,
        workerId: medPlanData[0].workerId,
        workerName: medPlanData[0].workerName,
        planStartDate: medPlanData[0].planStartDate,
        planEndDate: medPlanData[0].planEndDate,
        expectedUseTiming: { type: 1, content: '10:00' },
        expectedUseAt: moment(sDate, 'YYYY/MM/DD').add(2, 'd').set('hour', 10).set('minute', 0).toDate(),
        actualUseAt: null,
        status: 0,
        medicines: [
        {
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
          isUsed: false
        }],
        remark: '備註',
        __sc: 'TEST',
        __vn: 0,
        valid: true,
      },
      {
        companyId: medPlanData[0].companyId,
        planId: medPlanData[0]._id,
        planName: medPlanData[0].planName,
        caseId: medPlanData[0].caseId,
        caseName: medPlanData[0].caseName,
        workerId: medPlanData[0].workerId,
        workerName: medPlanData[0].workerName,
        planStartDate: medPlanData[0].planStartDate,
        planEndDate: medPlanData[0].planEndDate,
        expectedUseTiming: { type: 1, content: '10:00' },
        expectedUseAt: moment(sDate, 'YYYY/MM/DD').add(4, 'd').set('hour', 10).set('minute', 0).toDate(),
        actualUseAt: null,
        status: 4,
        medicines: [
        {
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
          isUsed: false
        }],
        remark: '備註',
        __sc: 'TEST',
        __vn: 0,
        valid: true,
      },
      {
        companyId: medPlanData[0].companyId,
        planId: medPlanData[0]._id,
        planName: medPlanData[0].planName,
        caseId: medPlanData[0].caseId,
        caseName: medPlanData[0].caseName,
        workerId: medPlanData[0].workerId,
        workerName: medPlanData[0].workerName,
        planStartDate: medPlanData[0].planStartDate,
        planEndDate: medPlanData[0].planEndDate,
        expectedUseTiming: { type: 1, content: '10:00' },
        expectedUseAt: moment(sDate, 'YYYY/MM/DD').add(5, 'd').set('hour', 10).set('minute', 0).toDate(),
        actualUseAt: null,
        status: 0,
        medicines: [
        {
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
          isUsed: false
        }],
        remark: '備註',
        __sc: 'TEST',
        __vn: 0,
        valid: true,
      },
      {
        _id: new ObjectId(),
        companyId: medPlanData[1].companyId,
        planId: medPlanData[1]._id,
        planName: medPlanData[1].planName,
        planStartDate: medPlanData[1].planStartDate,
        planEndDate: medPlanData[1].planEndDate,
        expectedUseAt: new Date('2022/05/16 07:45:00'),
        caseId: medPlanData[1].caseId,
        caseName: medPlanData[1].caseName,
        workerId: medPlanData[1].workerId,
        workerName: medPlanData[1].workerName,
        status: 0,
        medicines: [{
          medicineId: medPlanData[1].medicines[0].medicineId,
          drugCode: medData[0].drugCode,
          atcCode: medData[0].atcCode,
          chineseName: medData[0].chineseName,
          englishName: medData[0].englishName,
          indications: medData[0].indications,
          usageInfo: medData[0].usageInfo,
          form: medData[0].form,
          doses: medData[0].doses,
          doseUnit: medData[0].doseUnit,
          quantityOfMedUse: medPlanData[1].medicines[0].quantityOfMedUse,
          useFreq: medPlanData[1].medicines[0].useFreq,
          useTiming: medPlanData[1].medicines[0].useTiming,
          isUsed: false,
        }, {
          medicineId: medPlanData[1].medicines[1].medicineId,
          drugCode: medData[1].drugCode,
          atcCode: medData[1].atcCode,
          chineseName: medData[1].chineseName,
          englishName: medData[1].englishName,
          indications: medData[1].indications,
          usageInfo: medData[1].usageInfo,
          form: medData[1].form,
          doses: medData[1].doses,
          doseUnit: medData[1].doseUnit,
          quantityOfMedUse: medPlanData[1].medicines[1].quantityOfMedUse,
          useFreq: medPlanData[1].medicines[1].useFreq,
          useTiming: medPlanData[1].medicines[1].useTiming,
          isUsed: false,
        }],
        remark: '',
        __vn: 0,
        __sc: 'TEST',
        valid: true,
      },
      {
        _id: new ObjectId(),
        companyId: medPlanData[1].companyId,
        planId: medPlanData[1]._id,
        planName: medPlanData[1].planName,
        planStartDate: medPlanData[1].planStartDate,
        planEndDate: medPlanData[1].planEndDate,
        expectedUseAt: new Date('2022/05/16 10:45:00'),
        caseId: medPlanData[1].caseId,
        caseName: medPlanData[1].caseName,
        workerId: medPlanData[1].workerId,
        workerName: medPlanData[1].workerName,
        status: 0,
        medicines: [{
          medicineId: medPlanData[1].medicines[0].medicineId,
          drugCode: medData[0].drugCode,
          atcCode: medData[0].atcCode,
          chineseName: medData[0].chineseName,
          englishName: medData[0].englishName,
          indications: medData[0].indications,
          usageInfo: medData[0].usageInfo,
          form: medData[0].form,
          doses: medData[0].doses,
          doseUnit: medData[0].doseUnit,
          quantityOfMedUse: medPlanData[1].medicines[0].quantityOfMedUse,
          useFreq: medPlanData[1].medicines[0].useFreq,
          useTiming: medPlanData[1].medicines[0].useTiming,
          isUsed: false,
        },
        {
          medicineId: medPlanData[1].medicines[1].medicineId,
          drugCode: medData[1].drugCode,
          atcCode: medData[1].atcCode,
          chineseName: medData[1].chineseName,
          englishName: medData[1].englishName,
          indications: medData[1].indications,
          usageInfo: medData[1].usageInfo,
          form: medData[1].form,
          doses: medData[1].doses,
          doseUnit: medData[1].doseUnit,
          quantityOfMedUse: medPlanData[1].medicines[1].quantityOfMedUse,
          useFreq: medPlanData[1].medicines[1].useFreq,
          useTiming: medPlanData[1].medicines[1].useTiming,
          isUsed: false,
        }],
        remark: '',
        __vn: 0,
        __sc: 'TEST',
        valid: true,
      }
    ];

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
    test('[400:10010] 個案Id空白', async (done) => {
      const _data = lodash.cloneDeep(leaveData);
      _data.caseId = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10010, '個案Id空白')
      done();
    });
    test('[400:11216] 班表狀態空白', async (done) => {
      const _data = lodash.cloneDeep(leaveData);
      _data.scheduleStatus = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 11216, '班表狀態空白')
      done();
    });
    test('[400:10028] 日期空白', async (done) => {
      const _data = lodash.cloneDeep(leaveData);
      _data.date = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10028, '日期空白')
      done();
    });
    test('[400:10101] 個人ID空白', async (done) => {
      const _data = lodash.cloneDeep(leaveData);
      _data.personId = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10101, '個人ID空白')
      done();
    });
    test('[400:21219] 班表狀態類型不存在', async (done) => {
      const _data = lodash.cloneDeep(leaveData);
      _data.scheduleStatus = 9999;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 21219, '班表狀態類型不存在')
      done();
    });
    test('[400:20023] 日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(leaveData);
      _data.date = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20023, '日期格式有誤')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 班表狀態變更用藥提醒紀錄-成功(班表個案請假)', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, leaveData);

      const medRecordCol = NativeDBClient.getCollection(modelCodes.MEDICINERECORD);
      const query = {
        caseId: new ObjectId(leaveData.caseId),
        expectedUseAt: {
          $gte: new Date(leaveData.date),
          $lt: new Date(moment(leaveData.date, 'YYYY/MM/DD').add(1, 'd').format('YYYY/MM/DD'))
        }
      };
      const recordData = await medRecordCol.find(query).toArray();

      expect(res.status).toBe(200);
      expect(recordData).toHaveLength(2);
      expect(recordData[0].status).toBe(4);
      expect(recordData[1].status).toBe(4);
      done();
    });
    test('[200] 班表狀態變更用藥提醒紀錄-成功(班表個案銷假)', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, cancelLeaveData);

      const medRecordCol = NativeDBClient.getCollection(modelCodes.MEDICINERECORD);
      const query = {
        caseId: new ObjectId(cancelLeaveData.caseId),
        expectedUseAt: {
          $gte: new Date(cancelLeaveData.date),
          $lt: new Date(moment(cancelLeaveData.date, 'YYYY/MM/DD').add(1, 'd').format('YYYY/MM/DD'))
        }
      };
      const recordData = await medRecordCol.find(query).toArray();

      expect(res.status).toBe(200);
      expect(recordData).toHaveLength(1);
      expect(recordData[0].status).toBe(0);
      done();
    });
  });
});
