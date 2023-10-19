const request = require('supertest');
const lodash = require('lodash');
const moment = require('moment');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testPersonData = require('./seeder/data/person.json').data;
const testEmpLeaveHist = require('./seeder/data/employee-leave-history.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('複製建立護理排班', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/nursingShiftSchedules/copy';
  let agent;
  let headers;
  let nursingShiftData;
  let nursingShiftScheduleData;
  const _id1 = new ObjectId();
  const _id2 = new ObjectId();
  const _id3 = new ObjectId();
  const _id4 = new ObjectId();
  const data = {
    companyId: testCompanyData[0]._id,
    personId: '',
    fromStartDate: '2022/07/01',
    fromEndDate: '2022/07/04',
    toStartDate: '2022/07/23',
    toEndDate: '2022/07/26'
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

    nursingShiftData = [{
      _id: _id1,
      companyId: new ObjectId(testCompanyData[0]._id),
      code: 'A',
      name: 'A',
      startedAt: '08:00',
      endedAt: '16:00',
      detail: '',
      isDayOff: false,
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    }, {
      _id: _id2,
      companyId: new ObjectId(testCompanyData[0]._id),
      code: 'B',
      name: 'B',
      startedAt: '16:00',
      endedAt: '24:00',
      detail: '',
      isDayOff: false,
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    }, {
      _id: _id3,
      companyId: new ObjectId(testCompanyData[0]._id),
      code: 'C',
      name: 'C',
      startedAt: '00:00',
      endedAt: '08:00',
      detail: '',
      isDayOff: false,
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    }, {
      _id: _id4,
      companyId: new ObjectId(testCompanyData[0]._id),
      code: 'D',
      name: 'D',
      startedAt: '08:00',
      endedAt: '16:00',
      detail: '',
      isDayOff: true,
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    }, {
      _id: new ObjectId(),
      companyId: new ObjectId(testCompanyData[0]._id),
      code: 'E',
      name: 'E',
      startedAt: '20:00',
      endedAt: '23:00',
      detail: '',
      isDayOff: false,
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    }];
    const DATEFORMAT = 'YYYY/MM/DD';
    const TIMEFORMAT = 'YYYY/MM/DD hh:mm';
    const personId = new ObjectId(lodash.cloneDeep(testPersonData[0]._id));
    const personId2 = new ObjectId();
    nursingShiftScheduleData = [{
      _id: new ObjectId(),
      date: moment('2022/07/01', DATEFORMAT).toDate(),
      companyId: testCompanyData[0]._id,
      personId,
      startedAt: moment(`2022/07/01 ${nursingShiftData[0].startedAt}`, TIMEFORMAT).toDate(),
      endedAt:  moment(`2022/07/01 ${nursingShiftData[0].endedAt}`, TIMEFORMAT).toDate(),
      nursingShift: {
        nursingShiftId: nursingShiftData[0]._id,
        code: nursingShiftData[0].code,
        name: nursingShiftData[0].name,
        startedAt: nursingShiftData[0].startedAt,
        endedAt: nursingShiftData[0].endedAt,
        isDayOff: nursingShiftData[0].isDayOff,
      },
      employeeLeaveHistoryIds: [],
      valid: true,
      __vn: 0,
      __sc: 'Script',
    }, {
      _id: new ObjectId(),
      date: moment('2022/07/02', DATEFORMAT).toDate(),
      companyId: testCompanyData[0]._id,
      personId,
      startedAt: moment(`2022/07/02 ${nursingShiftData[1].startedAt}`, TIMEFORMAT).toDate(),
      endedAt:  moment(`2022/07/02 ${nursingShiftData[1].endedAt}`, TIMEFORMAT).toDate(),
      nursingShift: {
        nursingShiftId: nursingShiftData[1]._id,
        code: nursingShiftData[1].code,
        name: nursingShiftData[1].name,
        startedAt: nursingShiftData[1].startedAt,
        endedAt: nursingShiftData[1].endedAt,
        isDayOff: nursingShiftData[1].isDayOff,
      },
      employeeLeaveHistoryIds: [],
      valid: true,
      __vn: 0,
      __sc: 'Script',
    }, {
      _id: new ObjectId(),
      date: moment('2022/07/03', DATEFORMAT).toDate(),
      companyId: testCompanyData[0]._id,
      personId,
      startedAt: moment(`2022/07/03 ${nursingShiftData[0].startedAt}`, TIMEFORMAT).toDate(),
      endedAt:  moment(`2022/07/03 ${nursingShiftData[0].endedAt}`, TIMEFORMAT).toDate(),
      nursingShift: {
        nursingShiftId: nursingShiftData[0]._id,
        code: nursingShiftData[0].code,
        name: nursingShiftData[0].name,
        startedAt: nursingShiftData[0].startedAt,
        endedAt: nursingShiftData[0].endedAt,
        isDayOff: nursingShiftData[0].isDayOff,
      },
      employeeLeaveHistoryIds: [],
      valid: true,
    },  {
      _id: new ObjectId(),
      date: moment('2022/07/04', DATEFORMAT).toDate(),
      companyId: testCompanyData[0]._id,
      personId,
      startedAt: moment(`2022/07/04 ${nursingShiftData[2].startedAt}`, TIMEFORMAT).toDate(),
      endedAt:  moment(`2022/07/04 ${nursingShiftData[2].endedAt}`, TIMEFORMAT).toDate(),
      nursingShift: {
        nursingShiftId: nursingShiftData[2]._id,
        code: nursingShiftData[2].code,
        name: nursingShiftData[2].name,
        startedAt: nursingShiftData[2].startedAt,
        endedAt: nursingShiftData[2].endedAt,
        isDayOff: nursingShiftData[2].isDayOff,
      },
      employeeLeaveHistoryIds: [],
      valid: true,
    }, {
      _id: new ObjectId(),
      date: moment('2022/07/20', DATEFORMAT).toDate(),
      companyId: testCompanyData[0]._id,
      personId,
      startedAt: moment(`2022/07/20 ${nursingShiftData[1].startedAt}`, TIMEFORMAT).toDate(),
      endedAt:  moment(`2022/07/20 ${nursingShiftData[1].endedAt}`, TIMEFORMAT).toDate(),
      nursingShift: {
        nursingShiftId: nursingShiftData[1]._id,
        code: nursingShiftData[1].code,
        name: nursingShiftData[1].name,
        startedAt: nursingShiftData[1].startedAt,
        endedAt: nursingShiftData[1].endedAt,
        isDayOff: nursingShiftData[1].isDayOff,
      },
      employeeLeaveHistoryIds: [new ObjectId(testEmpLeaveHist[2]._id)],
      valid: true,
      __vn: 0,
      __sc: 'Script',
    }, {
      _id: new ObjectId(),
      date: moment('2022/07/25', DATEFORMAT).toDate(),
      companyId: testCompanyData[0]._id,
      personId,
      startedAt: moment(`2022/07/25 ${nursingShiftData[1].startedAt}`, TIMEFORMAT).toDate(),
      endedAt:  moment(`2022/07/25 ${nursingShiftData[1].endedAt}`, TIMEFORMAT).toDate(),
      nursingShift: {
        nursingShiftId: nursingShiftData[1]._id,
        code: nursingShiftData[1].code,
        name: nursingShiftData[1].name,
        startedAt: nursingShiftData[1].startedAt,
        endedAt: nursingShiftData[1].endedAt,
        isDayOff: nursingShiftData[1].isDayOff,
      },
      employeeLeaveHistoryIds: [],
      valid: true,
      __vn: 0,
      __sc: 'Script',
    }, {
      _id: new ObjectId(),
      date: moment('2022/07/01', DATEFORMAT).toDate(),
      companyId: testCompanyData[0]._id,
      personId: personId2,
      startedAt: moment(`2022/07/01 ${nursingShiftData[0].startedAt}`, TIMEFORMAT).toDate(),
      endedAt:  moment(`2022/07/01 ${nursingShiftData[0].endedAt}`, TIMEFORMAT).toDate(),
      nursingShift: {
        nursingShiftId: nursingShiftData[0]._id,
        code: nursingShiftData[0].code,
        name: nursingShiftData[0].name,
        startedAt: nursingShiftData[0].startedAt,
        endedAt: nursingShiftData[0].endedAt,
        isDayOff: nursingShiftData[0].isDayOff,
      },
      employeeLeaveHistoryIds: [],
      valid: true,
      __vn: 0,
      __sc: 'Script',
    }, {
      _id: new ObjectId(),
      date: moment('2022/07/04', DATEFORMAT).toDate(),
      companyId: testCompanyData[0]._id,
      personId: personId2,
      startedAt: moment(`2022/07/04 ${nursingShiftData[2].startedAt}`, TIMEFORMAT).toDate(),
      endedAt:  moment(`2022/07/04 ${nursingShiftData[2].endedAt}`, TIMEFORMAT).toDate(),
      nursingShift: {
        nursingShiftId: nursingShiftData[2]._id,
        code: nursingShiftData[2].code,
        name: nursingShiftData[2].name,
        startedAt: nursingShiftData[2].startedAt,
        endedAt: nursingShiftData[2].endedAt,
        isDayOff: nursingShiftData[2].isDayOff,
      },
      employeeLeaveHistoryIds: [],
      valid: true,
      __vn: 0,
      __sc: 'Script',
    }, {
      _id: new ObjectId(),
      date: moment('2022/07/27', DATEFORMAT).toDate(),
      companyId: testCompanyData[0]._id,
      personId: personId2,
      startedAt: moment(`2022/07/27 ${nursingShiftData[1].startedAt}`, TIMEFORMAT).toDate(),
      endedAt:  moment(`2022/07/27 ${nursingShiftData[1].endedAt}`, TIMEFORMAT).toDate(),
      nursingShift: {
        nursingShiftId: nursingShiftData[1]._id,
        code: nursingShiftData[1].code,
        name: nursingShiftData[1].name,
        startedAt: nursingShiftData[1].startedAt,
        endedAt: nursingShiftData[1].endedAt,
        isDayOff: nursingShiftData[1].isDayOff,
      },
      employeeLeaveHistoryIds: [new ObjectId(testEmpLeaveHist[2]._id)],
      valid: true,
      __vn: 0,
      __sc: 'Script',
    }];
    const nursingShiftCol = NativeDBClient.getCollection(modelCodes.NURSINGSHIFT);
    await nursingShiftCol.insertMany(nursingShiftData);
    const nursingShiftScheduleCol = NativeDBClient.getCollection(modelCodes.NURSINGSHIFTSCHEDULE);
    await nursingShiftScheduleCol.insertMany(nursingShiftScheduleData);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:11102] 公司ID空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.companyId = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 11102, '公司ID空白')
      done();
    });
    test('[400:10031] 複製開始時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.fromStartDate = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10031, '複製開始時間空白')
      done();
    });
    test('[400:10032] 複製結束時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.fromEndDate = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10032, '複製結束時間空白')
      done();
    });
    test('[400:10033] 貼上開始時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.toStartDate = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10033, '貼上開始時間空白')
      done();
    });
    test('[400:10034] 貼上結束時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.toEndDate = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10034, '貼上結束時間空白')
      done();
    });
    test('[400:20029] 複製開始時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.fromStartDate = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20029, '複製開始時間格式有誤')
      done();
    });
    test('[400:20030] 複製結束時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.fromEndDate = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20030, '複製結束時間格式有誤')
      done();
    });
    test('[400:20031] 貼上開始時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.toStartDate = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20031, '貼上開始時間格式有誤')
      done();
    });
    test('[400:20032] 貼上結束時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.toEndDate = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20032, '貼上結束時間格式有誤')
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21404] 護理排班時間間隔不夠', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.toStartDate = '2022/07/25';
      _data.toEndDate = '2022/07/28';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 21404, '護理排班時間間隔不夠')
      done();
    });
    test('[400:21404] 護理排班時間間隔不夠', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.fromStartDate = '2022/07/04';
      _data.fromEndDate = '2022/07/04';
      _data.toStartDate = '2022/07/28';
      _data.toStartDate = '2022/07/28';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 21404, '護理排班時間間隔不夠')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 複製建立護理排班-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, data);
      const nursingShiftScheduleCol = NativeDBClient.getCollection(modelCodes.NURSINGSHIFTSCHEDULE);
      const allData = await nursingShiftScheduleCol.find({ date: { $gte: moment(data.toStartDate, 'YYYY/MM/DD').toDate(), $lte: moment(data.toEndDate, 'YYYY/MM/DD').toDate() } }).toArray();
      const validData = await nursingShiftScheduleCol.find({ date: { $gte: moment(data.toStartDate, 'YYYY/MM/DD').toDate(), $lte: moment(data.toEndDate, 'YYYY/MM/DD').toDate() }, valid: true }).toArray();
      expect(res.status).toBe(200);
      expect(allData).toHaveLength(7);
      expect(validData).toHaveLength(6);
      done();
    });
  });
});
