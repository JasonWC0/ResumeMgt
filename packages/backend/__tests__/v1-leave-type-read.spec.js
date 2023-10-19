const request = require('supertest');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testLeaveTypeData = require('./seeder/data/leaveType.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('讀取請假時數設定', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/leaves/c/settingHours';
  let agent;
  let loginData;
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
      companyId: testCompanyData[0]._id,
    };
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('成功', () => {
    test('[200] 取得預設請假時數-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers);

      const defaultSetting = {
        personal: 14,
        physiology: 3,
        sick: 30,
      }
      expect(res.status).toBe(200);
      expect(res.body.result.personal).toEqual(defaultSetting.personal);
      expect(res.body.result.physiology).toEqual(defaultSetting.physiology);
      expect(res.body.result.sick).toEqual(defaultSetting.sick);
      done();
    });

    test('[200] 取得公司請假時數-成功', async (done) => {
      const query = {
        companyId: testLeaveTypeData[0].companyId.toString(),
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);

      expect(res.status).toBe(200);
      expect(res.body.result.funeralClass1).toEqual(testLeaveTypeData[0].funeralClass1);
      expect(res.body.result.sick).toEqual(testLeaveTypeData[0].sick);
      expect(res.body.result.annual._7y0m).toEqual(testLeaveTypeData[0].annual._7y0m);
      done();
    });
  });
});
