const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const employeeLeaveHistoryData = require('./seeder/data/employee-leave-history.json');
const testCompanyData = require('./seeder/data/company.json').data;


describe('刪除員工請假', () => {
  const METHOD = 'DELETE';
  const _ENDPOINT = '/main/app/api/v1/leaves';
  let agent;
  let loginData;
  const companyId = testCompanyData[1]._id;
  const leaveId = employeeLeaveHistoryData.data[0]._id;
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
      vn: employeeLeaveHistoryData.data[0].__vn,
      sc: 'Erpv3',
      companyId: companyId,
    };
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('資料規則驗證', () => {
    test('[404:90008] URI not found', async (done) => {
      const fakeLeave = 'fakeId';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${fakeLeave}`, headers, {});

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 90008,
        message: 'URI not found',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[刪除員工請假: 成功]', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${leaveId.toString()}`, headers, {});
      const leaveCol = NativeDBClient.getCollection(modelCodes.EMPLOYEELEAVEHISTORIES);
      const leaveData = await leaveCol.findOne({ _id: ObjectId(leaveId) });

      expect(res.status).toBe(200);
      expect(leaveData.valid).toBeFalsy();
      done();
    });
  });
})
