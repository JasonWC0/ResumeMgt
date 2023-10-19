const request = require('supertest');
const NativeDBClient = require('./basic/native-db-client');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const Base = require('./basic/basic');
const App = require('../app');
const caseData = require('./seeder/data/case.json');
const testCompanyData = require('./seeder/data/company.json').data;

describe('刪除個案', () => {
  const METHOD = 'DELETE';
  const _ENDPOINT = '/main/app/api/v1/cases';
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
      vn: 0,
      sc: 'Erpv3',
      cc: 'abc',
      companyId: testCompanyData[1]._id
    }

    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位檢查', () => {
    test('[400:90008] 無此個案', async (done) => {
      const fakeCaseId = '000000000000001d2e140001';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${fakeCaseId}`, headers);
      expect(res.status).toBe(404);
      done();
    });
  })

  describe('成功', () => {
    test.only('[200] 創建個案-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseData.data[0]._id}`, headers);
      expect(res.status).toBe(200);
      
      const caseCol = NativeDBClient.getCollection(modelCodes.CASE);
      const careRes = await caseCol.findOne({ _id: new ObjectId(caseData.data[0]._id) });
      expect(careRes.valid).toBeFalsy();
      done();
    });
  });
})
