/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-medicine-plan-create.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-08-17 11:00:25 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
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

describe('建立用藥計畫', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/medicinePlans';
  const caseId = new ObjectId().toString();
  const medId1 = new ObjectId().toString();
  const medId2 = new ObjectId().toString();
  let agent;
  let headers;

  const data = {
    companyId: testCompanyData[0]._id.toString(),
    caseId,
    caseName: '個案姓名',
    planName: '個案姓名-寶寶醫院-王醫師-2022/05/15-2022/05/20',
    workerId: new ObjectId().toString(),
    workerName: '施藥人姓名',
    autoAddHospital: true,
    hospital: '寶寶醫院',
    doctor: '王醫師',
    planStartDate: '2022/05/15',
    planEndDate: '2022/05/20',
    medicines: [{
      medicineId: medId1,
      quantityOfMedUse: '1,1/2',
      useFreq: {
        type: 2,
        content: [1, 4],
      },
      useTiming: {
        type: 0,
        content: [1, 2]
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
        content: ['10:00', '17:00']
      }
    }],
    remark: '備註',
    images: [],
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
      vn: 0,
      sc: 'Erpv3',
      companyId: testCompanyData[0]._id
    }

    const medData = [{
      _id: new ObjectId(medId1),
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
      _id: new ObjectId(medId2),
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
    await customMedicineCol.insertMany(medData);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-luna-service-client');
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:11102] 公司ID空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.companyId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11102, '公司ID空白')
      done();
    });
    test('[400:11207] 用藥計畫名稱空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.planName = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11207, '用藥計畫名稱空白')
      done();
    });
    test('[400:10010] 個案Id空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.caseId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 10010, '個案Id空白')
      done();
    });
    test('[400:10512] 個案姓名空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.caseName = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 10512, '個案姓名空白')
      done();
    });
    test('[400:11208] 施藥人Id空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.workerId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11208, '施藥人Id空白')
      done();
    });
    test('[400:11209] 施藥人姓名空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.workerName = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11209, '施藥人姓名空白')
      done();
    });
    test('[400:10019] 計畫開始日期空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.planStartDate = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 10019, '開始日期空白')
      done();
    });
    test('[400:10020] 計畫結束日期空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.planEndDate = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 10020, '結束日期空白')
      done();
    });
    test('[400:20009] 計畫開始日期格式有誤 YYYY/MM/DD', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.planStartDate = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 20009, '開始日期格式有誤')
      done();
    });
    test('[400:20010] 計畫結束日期格式有誤 YYYY/MM/DD', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.planEndDate = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 20010, '結束日期格式有誤')
      done();
    });
    test('[400:11210] 用藥計畫藥品列表空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines = [];
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11210, '用藥計畫藥品列表空白')
      done();
    });
    test('[400:11205] 藥品Id空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].medicineId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11205, '藥品Id空白')
      done();
    });
    test('[400:11206] 藥品用量空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].quantityOfMedUse = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11206, '藥品用量空白')
      done();
    });
    test('[400:21209] 用藥頻率類型不存在 0~3', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useFreq.type = 9999;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21209, '用藥頻率類型不存在')
      done();
    });
    test('[400:21210] 用藥頻率內容格式有誤: type=1, content需為數字', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useFreq.type = 1;
      _data.medicines[0].useFreq.content = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21210, '用藥頻率內容格式有誤')
      done();
    });
    test('[400:21210] 用藥頻率內容格式有誤: type=2, content需為array', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useFreq.type = 2;
      _data.medicines[0].useFreq.content = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21210, '用藥頻率內容格式有誤')
      done();
    });
    test('[400:21210] 用藥頻率內容格式有誤: type=2, content需為0~6的陣列', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useFreq.type = 2;
      _data.medicines[0].useFreq.content = [0, 9999];
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21210, '用藥頻率內容格式有誤')
      done();
    });
    test('[400:21210] 用藥頻率內容格式有誤: type=3, content需為array', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useFreq.type = 3;
      _data.medicines[0].useFreq.content = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21210, '用藥頻率內容格式有誤')
      done();
    });
    test('[400:21210] 用藥頻率內容格式有誤: type=3, content需為YYYY/MM/DD的陣列', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useFreq.type = 3;
      _data.medicines[0].useFreq.content = ['test', '2022/01/01'];
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21210, '用藥頻率內容格式有誤')
      done();
    });
    test('[400:21211] 用藥時間類型不存在 0~1', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useTiming.type = 9999;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21211, '用藥時間類型不存在')
      done();
    });
    test('[400:21212] 用藥時間內容格式有誤: type=0, content需為array', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useTiming.type = 0;
      _data.medicines[0].useTiming.content = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21212, '用藥時間內容格式有誤')
      done();
    });
    test('[400:21212] 用藥時間內容格式有誤: type=0, content需為0~6的陣列', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useTiming.type = 0;
      _data.medicines[0].useTiming.content = [0, 9999];
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21212, '用藥時間內容格式有誤')
      done();
    });
    test('[400:21212] 用藥時間內容格式有誤: type=1, content需為array', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useTiming.type = 1;
      _data.medicines[0].useTiming.content = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21212, '用藥時間內容格式有誤')
      done();
    });
    test('[400:21212] 用藥時間內容格式有誤: type=1, content需為HH:mm的陣列', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.medicines[0].useTiming.type = 1;
      _data.medicines[0].useTiming.content = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21212, '用藥時間內容格式有誤')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 建立用藥計畫-成功', async (done) => {
      const { LunaServiceClass } = LunaServiceClient;
      LunaServiceClass.normalAPI.mockResolvedValue({
        success: true,
        data:[
        {
          _id: '62fe07a2ff20cf10441cbcd8',
          scheduleDate: "2022-05-14T16:00:00.000Z",
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
            _id: '62fe07b0ff20cf10441cbd0c',
            scheduleId: '62fe07a2ff20cf10441cbcd8',
            isLeave: true,
            valid: true
          },
        }, {
          _id: '62fe07a2ff20cf10441cbcea',
          scheduleDate: "2022-05-15T16:00:00.000Z",
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
          _id: '62fe07a2ff20cf10441cbcdb',
          scheduleDate: "2022-05-16T16:00:00.000Z",
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
          _id: '62fe07a2ff20cf10441cbcde',
          scheduleDate: "2022-05-17T16:00:00.000Z",
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
          scheduleDate: "2022-05-18T16:00:00.000Z",
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
          scheduleDate: "2022-05-19T16:00:00.000Z",
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
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      expect(res.status).toBe(200);

      const medPlanCol = NativeDBClient.getCollection(modelCodes.MEDICINEPLAN);
      const medData = await medPlanCol.findOne({ _id: ObjectId(res.body.result.id) });

      expect(medData.planName).toBe(data.planName);
      expect(medData.caseId.toString()).toBe(data.caseId);
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
      const medRecordData = await medRecordCol.find({ planId: ObjectId(res.body.result.id) }).toArray();
      const medRecordData2 = await medRecordCol.find({ planId: ObjectId(res.body.result.id), status: 4 }).toArray();
      expect(medRecordData).toHaveLength(16);
      expect(medRecordData2).toHaveLength(4);

      const commonCol = NativeDBClient.getCollection(modelCodes.COMMONLYUSEDNAME);
      const commonHospitalData = await commonCol.findOne({ companyId: ObjectId(data.companyId), type: 'hospital'});
      const commonDoctorData = await commonCol.findOne({ companyId: ObjectId(data.companyId), type: 'doctor'});
      expect(commonHospitalData.name).toEqual([data.hospital]);
      expect(commonDoctorData).toEqual(null);
      done();
    });
  });
});
