const request = require('supertest');
const lodash = require('lodash');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const testPersonData = require('./seeder/data/person.json').data;
const testCompanyData = require('./seeder/data/company.json').data;

jest.mock('@erpv3/app-common/shared/connection-clients/default-luna-service-client');

describe('新增員工請假', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/leaves/employee';
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
    test('[400:20602] 請假時段內已有請假紀錄', async (done) => {
      const _data = {
        personId: testPersonData[0]._id,
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-01-01T01:00:00Z',
        leaveType: 1,
        salarySystem: 0,
        shiftList: []
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);


      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20602,
        message: '請假時段內已有請假紀錄',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[新增員工請假: 成功]', async (done) => {
      const _data = {
        personId: testPersonData[0]._id,
        startDate: '2023-09-05T00:00:00Z',
        endDate: '2023-09-05T09:00:00Z',
        leaveType: 1,
        salarySystem: 0,
        shiftList: []
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      expect(res.status).toBe(200);   
      expect(res.body.result.personId).toBe(_data.personId.toString());
      expect(res.body.result.startDate).toBe(_data.startDate);
      expect(res.body.result.endDate).toBe(_data.endDate);
      done();
    });
  });
})
