/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-medicine-plan-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-08-17 11:00:40 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const moment = require('moment');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const { LunaServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
jest.mock('@erpv3/app-common/shared/connection-clients/default-luna-service-client');

describe('更新用藥計畫', () => {
  const METHOD = 'PATCH';
  const _ENDPOINT = '/main/app/api/v1/medicinePlans';
  const medId1 = new ObjectId();
  const medId2 = new ObjectId();
  const medPlanId = new ObjectId().toString();
  let agent;
  let headers;

  const sDate = moment().subtract(3, 'd').format('YYYY/MM/DD');
  const eDate = moment().add(3, 'd').format('YYYY/MM/DD');
  const data = {
    caseName: 'new個案姓名',
    planName: 'new個案姓名-寶寶醫院2-陳醫師-2022/06/15-2022/06/20',
    workerId: new ObjectId().toString(),
    workerName: 'new施藥人姓名',
    hospital: '寶寶醫院2',
    doctor: '陳醫師',
    planStartDate: sDate,
    planEndDate: moment(sDate, 'YYYY/MM/DD').add(9, 'd').format('YYYY/MM/DD'),
    medicines: [{
      medicineId: medId1.toString(),
      quantityOfMedUse: '1,1/4',
      useFreq: {
        type: 3,
        content: [moment(sDate, 'YYYY/MM/DD').add(5, 'd').format('YYYY/MM/DD')],
      },
      useTiming: {
        type: 0,
        content: [1]
      }
    }, {
      medicineId: medId2.toString(),
      quantityOfMedUse: '1,1/2',
      useFreq: {
        type: 1,
        content: 3,
      },
      useTiming: {
        type: 1,
        content: ['10:00']
      }
    }],
    remark: '備註',
    images: [],
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
      _id: medId1,
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
      _id: medId2,
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
      _id: new ObjectId(medPlanId),
      companyId: new ObjectId(testCompanyData[0]._id.toString()),
      caseId: new ObjectId(),
      caseName: '個案姓名',
      planName: `個案姓名-寶寶醫院-王醫師-${sDate}-${eDate}`,
      workerId: new ObjectId().toString(),
      workerName: '施藥人姓名',
      hospital: '寶寶醫院',
      doctor: '王醫師',
      planStartDate: sDate,
      planEndDate:  eDate,
      medicines: [{
        medicineId: medId1,
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
        medicineId: medId2,
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
    }];
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
        actualUseAt: moment(sDate, 'YYYY/MM/DD').add(1, 'd').set('hour', 10).set('minute', 0).toDate(),
        status: 2,
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
          isUsed: true
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
    ]

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
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-luna-service-client');
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:11207] 用藥計畫名稱空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.planName = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 11207, '用藥計畫名稱空白')
      done();
    });
    test('[400:10512] 個案姓名空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.caseName = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 10512, '個案姓名空白')
      done();
    });
    test('[400:11208] 施藥人Id空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.workerId = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 11208, '施藥人Id空白')
      done();
    });
    test('[400:11209] 施藥人姓名空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.workerName = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 11209, '施藥人姓名空白')
      done();
    });
    test('[400:10019] 計畫開始日期空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.planStartDate = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 10019, '開始日期空白')
      done();
    });
    test('[400:10020] 計畫結束日期空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.planEndDate = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 10020, '結束日期空白')
      done();
    });
    test('[400:20009] 計畫開始日期格式有誤 YYYY/MM/DD', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.planStartDate = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 20009, '開始日期格式有誤')
      done();
    });
    test('[400:20010] 計畫結束日期格式有誤 YYYY/MM/DD', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.planEndDate = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 20010, '結束日期格式有誤')
      done();
    });
    test('[400:11210] 用藥計畫藥品列表空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines = [];
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 11210, '用藥計畫藥品列表空白')
      done();
    });
    test('[400:11205] 藥品Id空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].medicineId = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 11205, '藥品Id空白')
      done();
    });
    test('[400:11206] 藥品用量空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].quantityOfMedUse = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 11206, '藥品用量空白')
      done();
    });
    test('[400:21209] 用藥頻率類型不存在 0~3', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useFreq.type = 9999;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 21209, '用藥頻率類型不存在')
      done();
    });
    test('[400:21210] 用藥頻率內容格式有誤: type=1, content需為數字', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useFreq.type = 1;
      _data.medicines[0].useFreq.content = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 21210, '用藥頻率內容格式有誤')
      done();
    });
    test('[400:21210] 用藥頻率內容格式有誤: type=2, content需為array', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useFreq.type = 2;
      _data.medicines[0].useFreq.content = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 21210, '用藥頻率內容格式有誤')
      done();
    });
    test('[400:21210] 用藥頻率內容格式有誤: type=2, content需為0~6的陣列', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useFreq.type = 2;
      _data.medicines[0].useFreq.content = [0, 9999];
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 21210, '用藥頻率內容格式有誤')
      done();
    });
    test('[400:21210] 用藥頻率內容格式有誤: type=3, content需為array', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useFreq.type = 3;
      _data.medicines[0].useFreq.content = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 21210, '用藥頻率內容格式有誤')
      done();
    });
    test('[400:21210] 用藥頻率內容格式有誤: type=3, content需為YYYY/MM/DD的陣列', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useFreq.type = 3;
      _data.medicines[0].useFreq.content = ['test', '2022/01/01'];
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 21210, '用藥頻率內容格式有誤')
      done();
    });
    test('[400:21211] 用藥時間類型不存在 0~1', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useTiming.type = 9999;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 21211, '用藥時間類型不存在')
      done();
    });
    test('[400:21212] 用藥時間內容格式有誤: type=0, content需為array', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useTiming.type = 0;
      _data.medicines[0].useTiming.content = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 21212, '用藥時間內容格式有誤')
      done();
    });
    test('[400:21212] 用藥時間內容格式有誤: type=0, content需為0~6的陣列', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useTiming.type = 0;
      _data.medicines[0].useTiming.content = [0, 9999];
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 21212, '用藥時間內容格式有誤')
      done();
    });
    test('[400:21212] 用藥時間內容格式有誤: type=1, content需為array', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useTiming.type = 1;
      _data.medicines[0].useTiming.content = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 21212, '用藥時間內容格式有誤')
      done();
    });
    test('[400:21212] 用藥時間內容格式有誤: type=1, content需為HH:mm的陣列', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useTiming.type = 1;
      _data.medicines[0].useTiming.content = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, _data);
      Base.verifyError(res, 21212, '用藥時間內容格式有誤')
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21214] 用藥計畫不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/test`, headers, data);
      Base.verifyError(res, 21214, '用藥計畫不存在')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 更新用藥計畫-成功', async (done) => {
      const { LunaServiceClass } = LunaServiceClient;
      LunaServiceClass.normalAPI.mockResolvedValue({
        success: true,
        data:[{
          _id: '62fe07a2ff20cf10441cbcde',
          scheduleDate: new Date(moment(sDate, 'YYYY/MM/DD').add(3, 'd')),
          serviceItems: [
            {
              minStop: 0,
              hourStop: 17,
              minStart: 0,
              hourStart: 8,
            },
            {
              minStop: 0,
              hourStop: 8,
              minStart: 40,
              hourStart: 7,
            },
            {
              minStop: 20,
              hourStop: 17,
              minStart: 0,
              hourStart: 17,
            },
          ],
          punchRecord: {
            _id: '62fe07beff20cf10441cbd1a',
            scheduleId: '62fe07a2ff20cf10441cbcde',
            isLeave: true,
            valid: true
          },
        }, {
          _id: '62fe07a2ff20cf10441cbced',
          scheduleDate: new Date(moment(sDate, 'YYYY/MM/DD').add(4, 'd')),
          serviceItems: [
            {
              minStop: 0,
              hourStop: 17,
              minStart: 0,
              hourStart: 8,
            },
            {
              minStop: 0,
              hourStop: 8,
              minStart: 40,
              hourStart: 7,
            },
            {
              minStop: 20,
              hourStop: 17,
              minStart: 0,
              hourStart: 17,
            },
          ],
          punchRecord: {
            _id: '62fe07beff20cf10441cbd1a',
            scheduleId: '62fe07a2ff20cf10441cbced',
            valid: true
          },
        }, {
          _id: '62fe07a2ff20cf10441cbce1',
          scheduleDate: new Date(moment(sDate, 'YYYY/MM/DD').add(5, 'd')),
          serviceItems: [
            {
              minStop: 0,
              hourStop: 17,
              minStart: 0,
              hourStart: 8,
            },
            {
              minStop: 0,
              hourStop: 8,
              minStart: 40,
              hourStart: 7,
            },
            {
              minStop: 20,
              hourStop: 17,
              minStart: 0,
              hourStart: 17,
            },
          ],
          punchRecord: null,
        }, {
          _id: '630c580dc18c50d05357e38c',
          scheduleDate: new Date(moment(sDate, 'YYYY/MM/DD').add(7, 'd')),
          serviceItems: [
            {
              minStop: 0,
              hourStop: 17,
              minStart: 0,
              hourStart: 8,
            },
            {
              minStop: 0,
              hourStop: 8,
              minStart: 40,
              hourStart: 7,
            },
            {
              minStop: 20,
              hourStop: 17,
              minStart: 0,
              hourStart: 17,
            },
          ],
          punchRecord: null,
        }, {
          _id: '630c5831dfc22948fc426e07',
          scheduleDate: new Date(moment(sDate, 'YYYY/MM/DD').add(8, 'd')),
          serviceItems: [
            {
              minStop: 0,
              hourStop: 17,
              minStart: 0,
              hourStart: 8,
            },
            {
              minStop: 0,
              hourStop: 8,
              minStart: 40,
              hourStart: 7,
            },
            {
              minStop: 20,
              hourStop: 17,
              minStart: 0,
              hourStart: 17,
            },
          ],
          punchRecord: {
            _id: '62fe07beff20cf10441cbd1a',
            scheduleId: '62fe07a2ff20cf10441cbcde',
            isLeave: true,
            valid: true
          },
        }, {
          _id: '630c58407b842fd32ba6cbdb',
          scheduleDate: new Date(moment(sDate, 'YYYY/MM/DD').add(9, 'd')),
          serviceItems: [
            {
              minStop: 0,
              hourStop: 17,
              minStart: 0,
              hourStart: 8,
            },
            {
              minStop: 0,
              hourStop: 8,
              minStart: 40,
              hourStart: 7,
            },
            {
              minStop: 20,
              hourStop: 17,
              minStart: 0,
              hourStart: 17,
            },
          ],
          punchRecord: null,
        }],
      });
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${medPlanId}`, headers, data);
      expect(res.status).toBe(200);

      const medPlanCol = NativeDBClient.getCollection(modelCodes.MEDICINEPLAN);
      const medData = await medPlanCol.findOne({ _id: ObjectId(medPlanId) });

      expect(medData.planName).toBe(data.planName);
      expect(medData.caseName).toBe(data.caseName);
      expect(medData.workerId.toString()).toBe(data.workerId);
      expect(medData.workerName).toBe(data.workerName);
      expect(medData.hospital).toBe(data.hospital);
      expect(medData.doctor).toBe(data.doctor);
      expect(Date(medData.planStartDate)).toEqual(Date(data.planStartDate));
      expect(Date(medData.planEndDate)).toEqual(Date(data.planEndDate));
      expect(medData.medicines[0].medicineId.toString()).toBe(data.medicines[0].medicineId);
      expect(medData.medicines[0].quantityOfMedUse).toBe(data.medicines[0].quantityOfMedUse);
      expect(medData.medicines[0].useFreq).toEqual(data.medicines[0].useFreq);
      expect(medData.medicines[0].useTiming).toEqual(data.medicines[0].useTiming);
      expect(medData.medicines[1].medicineId.toString()).toBe(data.medicines[1].medicineId);
      expect(medData.medicines[1].quantityOfMedUse).toBe(data.medicines[1].quantityOfMedUse);
      expect(medData.medicines[1].useFreq).toEqual(data.medicines[1].useFreq);
      expect(medData.medicines[1].useTiming).toEqual(data.medicines[1].useTiming);
      expect(medData.remark).toEqual(data.remark);

      const medRecordCol = NativeDBClient.getCollection(modelCodes.MEDICINERECORD);
      const medRecordDataAll = await medRecordCol.find({ planId: ObjectId(medPlanId) }).toArray();
      const medRecordDataTrue = await medRecordCol.find({ planId: ObjectId(medPlanId), valid: true }).toArray();
      const medRecordDataLeave = await medRecordCol.find({ planId: ObjectId(medPlanId), status: 4, valid: true }).toArray();
      expect(medRecordDataAll).toHaveLength(8);
      expect(medRecordDataTrue).toHaveLength(4);
      expect(medRecordDataLeave).toHaveLength(1);
      done();
    });
  });
});
