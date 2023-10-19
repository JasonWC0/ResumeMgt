
const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('取得護理排班班別列表', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/nursingShifts';
  let agent;
  let headers;
  let nursingShiftData;

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

  describe('成功', () => {
    test('[200] 取得護理排班班別列表(全取)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(4);
      done();
    });
    test('[200] 取得護理排班班別列表(全取)-成功', async (done) => {
      const query = {
        f: 1
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(4);
      done();
    });
    test('[200] 取得護理排班班別列表-成功', async (done) => {
      const query = {
        f: false
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(3);
      done();
    });
    test('[200] 取得護理排班班別列表-成功', async (done) => {
      const query = {
        f: 'N'
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(3);
      done();
    });
  });
});
