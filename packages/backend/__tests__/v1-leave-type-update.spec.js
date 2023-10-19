const request = require('supertest');
const lodash = require('lodash');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testLeaveTypeData = require('./seeder/data/leaveType.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('更新請假時數設定', () => {
  const METHOD = 'PATCH';
  const _ENDPOINT = '/main/app/api/v1/leaves/c/settingHours';
  let agent;
  let loginData;
  let headers;

  const body = {
    companyId: testLeaveTypeData[0].companyId,
    sick: 70,
    annual: {
      _7y0m: 70,
    }
  }

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
      vn: 0,
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

  describe('資料規則驗證', () => {
    test('[400:21121] 公司不存在', async (done) => {
      const _data = lodash.cloneDeep(body);
      _data.companyId = 'fakeCompany';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 21121, '公司不存在');
      done();
    });
    test('[400:21145] 時數格式錯誤', async (done) => {
      const _data = lodash.cloneDeep(body);
      _data.sick = '70';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 21145, '時數格式錯誤');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 更新公司請假時數-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, body);
      const leaveTypeCol = NativeDBClient.getCollection(modelCodes.LEAVETYPE);
      const leaveTypeRes = await leaveTypeCol.findOne({ companyId: testLeaveTypeData[0].companyId });

      expect(res.status).toBe(200);
      expect(leaveTypeRes.sick).toEqual(body.sick);
      expect(leaveTypeRes.annual._7y0m).toEqual(body.annual._7y0m);
      expect(leaveTypeRes.annual._8y0m).toEqual(testLeaveTypeData[0].annual._8y0m);
      done();
    });
  });
});
