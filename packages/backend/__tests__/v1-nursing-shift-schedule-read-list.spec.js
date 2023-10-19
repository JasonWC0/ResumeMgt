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

describe('取得護理排班列表', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/nursingShiftSchedules';
  let agent;
  let headers;
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
    const nursingShiftData = [{
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
    test('[400:10035] 時間篩選條件空白', async (done) => {
      const query = {};
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);
      Base.verifyError(res, 10035, '時間篩選條件空白')
      done();
    });
    test('[400:20017] 年不符合規則', async (done) => {
      const query = {
        y: 100,
        m: 7,
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);
      Base.verifyError(res, 20017, '年不符合規則')
      done();
    });
    test('[400:20018] 月不符合規則', async (done) => {
      const query = {
        y: 2022,
        m: 99,
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);
      Base.verifyError(res, 20018, '月不符合規則')
      done();
    });
    test('[400:20023] 日期格式有誤', async (done) => {
      const query = {
        dates: '2022/12/1,test',
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);
      Base.verifyError(res, 20023, '日期格式有誤')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 取得護理排班列表(年月)-成功', async (done) => {
      const query = {
        y: 2022,
        m: 7
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(5);
      done();
    });
    test('[200] 取得護理排班列表(指定日期)-成功', async (done) => {
      const query = {
        dates: '2022/07/01,2022/07/02'
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(3);
      done();
    });
    test('[200] 取得護理排班列表(指定年月,人)-成功', async (done) => {
      const query = {
        y: 2022,
        m: 7,
        personId: testPersonData[0]._id.toString(),
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(4);
      done();
    });
    test('[200] 取得護理排班列表(指定日期,人)-成功', async (done) => {
      const query = {
        dates: '2022/07/20',
        personId: testPersonData[0]._id.toString(),
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(1);
      expect(new Date(res.body.result[0].date)).toEqual(moment('2022/07/20', 'YYYY/MM/DD').toDate());
      expect(res.body.result[0].shiftSchedules).toHaveLength(1);
      expect(res.body.result[0].shiftSchedules[0].id.toString()).toBe(nursingShiftScheduleData[3]._id.toString());
      expect(res.body.result[0].shiftSchedules[0].nursingShiftId.toString()).toBe(nursingShiftScheduleData[3].nursingShift.nursingShiftId.toString());
      expect(res.body.result[0].shiftSchedules[0].nursingShiftCode).toBe(nursingShiftScheduleData[3].nursingShift.code);
      expect(res.body.result[0].shiftSchedules[0].nursingShiftStartedAt).toBe(nursingShiftScheduleData[3].nursingShift.startedAt);
      expect(res.body.result[0].shiftSchedules[0].nursingShiftEndedAt).toBe(nursingShiftScheduleData[3].nursingShift.endedAt);
      expect(res.body.result[0].shiftSchedules[0].employeeLeaveHistoryList).toHaveLength(1);
      expect(res.body.result[0].shiftSchedules[0].employeeLeaveHistoryList[0].id.toString()).toBe(testEmpLeaveHist[2]._id.toString());
      expect(res.body.result[0].shiftSchedules[0].employeeLeaveHistoryList[0].leaveType).toBe(testEmpLeaveHist[2].leaveType);
      done();
    });
  });
});
