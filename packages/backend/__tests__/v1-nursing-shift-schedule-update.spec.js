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

describe('編輯護理排班', () => {
  const METHOD = 'PATCH';
  const _ENDPOINT = '/main/app/api/v1/nursingShiftSchedules';
  let agent;
  let headers;
  let nursingShiftData;
  let nursingShiftScheduleData;

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

    const _id1 = new ObjectId();
    const _id2 = new ObjectId();
    const _id3 = new ObjectId();
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
      _id: new ObjectId(),
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
    const personId = ObjectId(lodash.cloneDeep(testPersonData[0]._id));
    nursingShiftScheduleData = [{
      _id: ObjectId(),
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
      _id: ObjectId(),
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
      _id: ObjectId(),
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
    }, {
      _id: ObjectId(),
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
      employeeLeaveHistoryIds: [ObjectId(testEmpLeaveHist[2]._id)],
      valid: true,
      __vn: 0,
      __sc: 'Script',
    }, {
      _id: ObjectId(),
      date: moment('2022/07/01', DATEFORMAT).toDate(),
      companyId: testCompanyData[0]._id,
      personId: ObjectId(),
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
    test('[400:11402] 護理班別Id空白', async (done) => {
      const obj = {};
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${nursingShiftScheduleData[2]._id.toString()}`, headers, obj);
      Base.verifyError(res, 11402, '護理班別Id空白')
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21403] 護理排班不存在', async (done) => {
      const obj = {
        nursingShiftId: nursingShiftData[4]._id.toString()
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/xxxxxxxxxxx`, headers, obj);
      Base.verifyError(res, 21403, '護理排班不存在')
      done();
    });
    test('[400:21401] 護理班別不存在', async (done) => {
      const obj = {
        nursingShiftId: 'xxxxxxxxxxxx'
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${nursingShiftScheduleData[2]._id.toString()}`, headers, obj);
      Base.verifyError(res, 21401, '護理班別不存在')
      done();
    });
    test('[400:21404] 護理排班時間間隔不夠', async (done) => {
      const obj = {
        nursingShiftId: nursingShiftData[2]._id.toString()
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${nursingShiftScheduleData[2]._id.toString()}`, headers, obj);
      Base.verifyError(res, 21404, '護理排班時間間隔不夠')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 編輯護理排班-成功', async (done) => {
      const obj = {
        nursingShiftId: nursingShiftData[4]._id.toString()
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${nursingShiftScheduleData[2]._id.toString()}`, headers, obj);
      const nursingShiftScheduleCol = NativeDBClient.getCollection(modelCodes.NURSINGSHIFTSCHEDULE);
      const data = await nursingShiftScheduleCol.findOne({ _id: nursingShiftScheduleData[2]._id });
      expect(res.status).toBe(200);
      expect(data.startedAt).toEqual(moment(`2022/07/03 ${nursingShiftData[4].startedAt}`, 'YYYY/MM/DD hh:mm').toDate());
      expect(data.endedAt).toEqual(moment(`2022/07/03 ${nursingShiftData[4].endedAt}`, 'YYYY/MM/DD hh:mm').toDate());
      expect(data.nursingShift.nursingShiftId.toString()).toBe(nursingShiftData[4]._id.toString());
      expect(data.nursingShift.code).toBe(nursingShiftData[4].code);
      expect(data.nursingShift.startedAt).toBe(nursingShiftData[4].startedAt);
      expect(data.nursingShift.endedAt).toBe(nursingShiftData[4].endedAt);
      expect(data.nursingShift.isDayOff).toBe(nursingShiftData[4].isDayOff);
      done();
    });
  });
});
