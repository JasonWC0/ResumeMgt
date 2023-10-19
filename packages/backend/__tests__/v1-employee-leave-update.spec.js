const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const employeeLeaveHistoryData = require('./seeder/data/employee-leave-history.json');
const testPersonData = require('./seeder/data/person.json').data;
const testCompanyData = require('./seeder/data/company.json').data;


describe('新增員工請假', () => {
  const METHOD = 'PATCH';
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
    test('[400:20600] 員工請假類別錯誤', async (done) => {
      const _data = {
        leaveType: -1,
        memo: 'unitTest'
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${leaveId.toString()}`, headers, _data);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20600,
        message: '員工請假類別錯誤',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[編輯員工請假: 成功]', async (done) => {
      const _data = {
        leaveType: 4,
        memo: 'unitTest'
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${leaveId.toString()}`, headers, _data);
      const leaveCol = NativeDBClient.getCollection(modelCodes.EMPLOYEELEAVEHISTORIES);
      const leaveData = await leaveCol.findOne({ _id: ObjectId(leaveId), valid: true });

      expect(res.status).toBe(200);
      expect(leaveData.leaveType).toBe(_data.leaveType);
      expect(leaveData.memo).toBe(_data.memo);
      done();
    });
  });
})
