const request = require('supertest');
const lodash = require('lodash');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const testPersonData = require('./seeder/data/person.json').data;
const testCompanyData = require('./seeder/data/company.json').data;


describe('查詢員工預計請假時數', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/leaves/leaveHours';
  let agent;
  let loginData;
  const companyId = testCompanyData[1]._id;
  let headers;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    loginData = await Base.login(agent);
    headers = {
      Authorization: `Bearer ${loginData.token}`,
      vn: '',
      sc: 'Erpv3',
      companyId: companyId,
    };
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-luna-service-client');
    done();
  })

  describe('資料規則驗證', () => {
    test('[400:20009] 開始日期格式有誤', async (done) => {
      const _data = {
        personId: testPersonData[0]._id,
        startDate: '2023-99-20T00:00:00Z',
        endDate: '2023-07-20T01:00:00Z',
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);


      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20009,
        message: '開始日期格式有誤',
        result: null,
      });
      done();
    });

    test('[400:20010] 結束日期格式有誤', async (done) => {
      const _data = {
        personId: testPersonData[0]._id,
        startDate: '2023-09-20T00:00:00Z',
        endDate: '2023-09-00T01:00:00Z',
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);


      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20010,
        message: '結束日期格式有誤',
        result: null,
      });
      done();
    });

    test('[400:20607] 請假結束日不得早於起始日', async (done) => {
      const _data = {
        personId: testPersonData[0]._id,
        startDate: '2023-09-20T00:00:00Z',
        endDate: '2023-09-19T01:00:00Z',
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);


      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20607,
        message: '請假結束日不得早於起始日',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[查詢員工預計請假時數: 成功]', async (done) => {
      const _data = {
        personId: testPersonData[0]._id,
        startDate: '2023-09-05T00:00:00.000Z',
        endDate: '2023-09-05T09:00:00.000Z',
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      expect(res.status).toBe(200);   
      expect(res.body.result['2023/09/05'].hours).toBe(8);
      done();
    });
  });
})
