
const request = require('supertest');
const moment = require('moment');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testPersonData = require('./seeder/data/person.json').data;
const testEmpLeaveHist = require('./seeder/data/employee-leave-history.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('更新護理排班班別', () => {
  const METHOD = 'PATCH';
  const _ENDPOINT = '/main/app/api/v1/nursingShifts';
  let agent;
  let headers;
  let nursingShiftData;
  let nursingShiftScheduleData;
  const _id1 = new ObjectId();
  const _id2 = new ObjectId();
  const _id3 = new ObjectId();
  const data = {
    code: 'A1',
    name: 'A1',
    startedAt: '10:00',
    endedAt: '17:00',
    detail: 'test',
    isDayOff: true,
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
    }];

    const DATEFORMAT = 'YYYY/MM/DD';
    const TIMEFORMAT = 'YYYY/MM/DD hh:mm';
    const futureDate1 = moment().startOf('days').add(1, 'days').format(DATEFORMAT);
    const futureDate2 = moment().startOf('days').add(5, 'days').format(DATEFORMAT);
    const personId = ObjectId(lodash.cloneDeep(testPersonData[0]._id));
    nursingShiftScheduleData = [{
      _id: ObjectId(),
      date: moment('2022/07/01', DATEFORMAT).toDate(),
      companyId: testCompanyData[0]._id,
      personId,
      startedAt: moment(`2022/07/01 ${nursingShiftData[0].startedAt}`, TIMEFORMAT).toDate(),
      endedAt:  moment(`2022/07/01 ${nursingShiftData[0].endedAt}`, TIMEFORMAT).toDate(),
      nursingShift: {
        nursingShiftId: nursingShiftData[0]._id,  //_id1
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
        nursingShiftId: nursingShiftData[1]._id,  //_id2
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
        nursingShiftId: nursingShiftData[0]._id,  //_id1
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
      date: moment(futureDate1, DATEFORMAT).toDate(),
      companyId: testCompanyData[0]._id,
      personId,
      startedAt: moment(`${futureDate1} ${nursingShiftData[1].startedAt}`, TIMEFORMAT).toDate(),
      endedAt:  moment(`${futureDate1} ${nursingShiftData[1].endedAt}`, TIMEFORMAT).toDate(),
      nursingShift: {
        nursingShiftId: nursingShiftData[0]._id, // _id1
        code: nursingShiftData[0].code,
        name: nursingShiftData[0].name,
        startedAt: nursingShiftData[0].startedAt,
        endedAt: nursingShiftData[0].endedAt,
        isDayOff: nursingShiftData[0].isDayOff,
      },
      employeeLeaveHistoryIds: [ObjectId(testEmpLeaveHist[2]._id)],
      valid: true,
      __vn: 0,
      __sc: 'Script',
    }, {
      _id: ObjectId(),
      date: moment(futureDate2, DATEFORMAT).toDate(),
      companyId: testCompanyData[0]._id,
      personId: ObjectId(),
      startedAt: moment(`${futureDate2} ${nursingShiftData[0].startedAt}`, TIMEFORMAT).toDate(),
      endedAt:  moment(`${futureDate2} ${nursingShiftData[0].endedAt}`, TIMEFORMAT).toDate(),
      nursingShift: {
        nursingShiftId: nursingShiftData[0]._id,  // _id1
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
    test('[400:11400] 護理班別代碼簡稱空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.code = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${nursingShiftData[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 11400, '護理班別代碼簡稱空白')
      done();
    });
    test('[400:11401] 護理班別名稱空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.name = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${nursingShiftData[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 11401, '護理班別名稱空白')
      done();
    });
    test('[400:10029] 開始時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.startedAt = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${nursingShiftData[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 10029, '開始時間空白')
      done();
    });
    test('[400:10030] 結束時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.endedAt = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${nursingShiftData[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 10030, '結束時間空白')
      done();
    });
    test('[400:20027] 起始時間不符合規則', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.startedAt = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${nursingShiftData[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 20027, '起始時間不符合規則')
      done();
    });
    test('[400:20028] 結束時間不符合規則', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.endedAt = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${nursingShiftData[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 20028, '結束時間不符合規則')
      done();
    });
    test('[400:21400] 護理班別是否休息班格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.isDayOff = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${nursingShiftData[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 21400, '護理班別是否休息班格式有誤')
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21401] 護理班別不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/xxxxxxxxxxx`, headers, data);
      Base.verifyError(res, 21401, '護理班別不存在')
      done();
    });
    test('[400:21402] 護理班別代碼簡稱已存在', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.code = 'B';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${nursingShiftData[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 21402, '護理班別代碼簡稱已存在')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 更新護理排班班別-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${nursingShiftData[0]._id}`, headers, data);
      const nursingShiftCol = NativeDBClient.getCollection(modelCodes.NURSINGSHIFT);
      const theOne = await nursingShiftCol.findOne({ _id: nursingShiftData[0]._id });
      const nursingShiftScheduleCol = NativeDBClient.getCollection(modelCodes.NURSINGSHIFTSCHEDULE);
      const pastData = await nursingShiftScheduleCol.find({ date: { $lt: moment().startOf('days').add(1, 'days').toDate() }, 'nursingShift.nursingShiftId': nursingShiftData[0]._id }).toArray();
      const futureDataNoLeave = await nursingShiftScheduleCol.find({ date: { $gte: moment().startOf('days').add(1, 'days').toDate() }, 'nursingShift.nursingShiftId': nursingShiftData[0]._id, $or: [ { employeeLeaveHistoryIds: { $in: [null, []] } }, {employeeLeaveHistoryIds: { $exists: false } }] }).toArray();
      const futureDataHasLeave = await nursingShiftScheduleCol.find({ date: { $gte: moment().startOf('days').add(1, 'days').toDate() }, 'nursingShift.nursingShiftId': nursingShiftData[0]._id, $or: [ { employeeLeaveHistoryIds: { $nin: [null, []] } }, {employeeLeaveHistoryIds: { $exists: false } }] }).toArray();

      expect(res.status).toBe(200);
      expect(theOne.code).toBe(data.code);
      expect(theOne.name).toBe(data.name);
      expect(theOne.startedAt).toBe(data.startedAt);
      expect(theOne.endedAt).toBe(data.endedAt);
      expect(theOne.detail).toBe(data.detail);
      expect(theOne.isDayOff).toEqual(data.isDayOff);
      expect(pastData[0].nursingShift.code).toEqual(nursingShiftData[0].code);
      expect(pastData[0].nursingShift.name).toEqual(nursingShiftData[0].name);
      expect(pastData[0].nursingShift.startedAt).toEqual(nursingShiftData[0].startedAt);
      expect(pastData[0].nursingShift.endedAt).toEqual(nursingShiftData[0].endedAt);
      expect(pastData[0].nursingShift.isDayOff).toEqual(nursingShiftData[0].isDayOff)
      expect(futureDataHasLeave[0].nursingShift.code).toEqual(nursingShiftData[0].code);
      expect(futureDataHasLeave[0].nursingShift.name).toEqual(nursingShiftData[0].name);
      expect(futureDataHasLeave[0].nursingShift.startedAt).toEqual(nursingShiftData[0].startedAt);
      expect(futureDataHasLeave[0].nursingShift.endedAt).toEqual(nursingShiftData[0].endedAt);
      expect(futureDataHasLeave[0].nursingShift.isDayOff).toEqual(nursingShiftData[0].isDayOff)
      expect(futureDataNoLeave[0].nursingShift.code).toEqual(data.code);
      expect(futureDataNoLeave[0].nursingShift.name).toEqual(data.name);
      expect(futureDataNoLeave[0].nursingShift.startedAt).toEqual(data.startedAt);
      expect(futureDataNoLeave[0].nursingShift.endedAt).toEqual(data.endedAt);
      expect(futureDataNoLeave[0].nursingShift.isDayOff).toEqual(data.isDayOff)
      done();
    });
  });
});
