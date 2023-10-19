
const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('建立護理排班班別', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/nursingShifts';
  let agent;
  let headers;
  let nursingShiftData;
  const _id1 = new ObjectId();
  const _id2 = new ObjectId();
  const _id3 = new ObjectId();
  const data = {
    companyId: testCompanyData[0]._id,
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
      startedAt: '14:00',
      endedAt: '22:00',
      detail: '',
      isDayOff: true,
      __vn: 0,
      __sc: 'TEST',
      valid: true,
    }];
    const nursingShiftCol = NativeDBClient.getCollection(modelCodes.NURSINGSHIFT);
    await nursingShiftCol.insertMany(nursingShiftData);
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
    test('[400:11400] 護理班別代碼簡稱空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.code = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 11400, '護理班別代碼簡稱空白')
      done();
    });
    test('[400:11401] 護理班別名稱空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.name = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 11401, '護理班別名稱空白')
      done();
    });
    test('[400:10029] 開始時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.startedAt = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10029, '開始時間空白')
      done();
    });
    test('[400:10030] 結束時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.endedAt = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10030, '結束時間空白')
      done();
    });
    test('[400:20027] 起始時間不符合規則', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.startedAt = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20027, '起始時間不符合規則')
      done();
    });
    test('[400:20028] 結束時間不符合規則', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.endedAt = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20028, '結束時間不符合規則')
      done();
    });
    test('[400:21400] 護理班別是否休息班格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.isDayOff = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 21400, '護理班別是否休息班格式有誤')
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21402] 護理班別代碼簡稱已存在', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.code = 'B';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 21402, '護理班別代碼簡稱已存在')
      done();
    });
  });

  describe('成功', () => {
    test('[200] 建立護理排班班別-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, data);
      const nursingShiftCol = NativeDBClient.getCollection(modelCodes.NURSINGSHIFT);
      const theOne = await nursingShiftCol.findOne({ code: data.code, valid: true });

      expect(res.status).toBe(200);
      expect(theOne.code).toBe(data.code);
      expect(theOne.name).toBe(data.name);
      expect(theOne.startedAt).toBe(data.startedAt);
      expect(theOne.endedAt).toBe(data.endedAt);
      expect(theOne.detail).toBe(data.detail);
      expect(theOne.isDayOff).toEqual(data.isDayOff);
      done();
    });
  });
});
