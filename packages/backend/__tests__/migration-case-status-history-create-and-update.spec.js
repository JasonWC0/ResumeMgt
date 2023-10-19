const request = require('supertest');
const lodash = require('lodash');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const testCompanyData = require('./seeder/data/company.json').data;
const caseData = require('./seeder/data/case.json').data;
const modelCodes = require('./enums/model-codes');
const { ObjectId } = require('mongodb');

describe('新建與更新個案狀態歷史', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/migration/api/cases/statusHistories';
  let agent;
  let loginData;
  let headers;
  let query;
  const createObj = {
    caseId: caseData[0]._id,
    hc:[{
      date : '2022-09-10T00:00:00.000Z',
      status : 0,
      pendingType: null,
      reason : null,
      memo : '87978588',
      createdAt : '2022-09-16T03:41:11.979Z',
      updatedAt : '2022-09-16T03:41:11.979Z',
    }],
    dc:[{
      date : '2022-09-11T00:00:00.000Z',
      status : 0,
      pendingType: null,
      reason : null,
      memo : '3345678',
      createdAt : '2022-09-16T03:41:11.979Z',
      updatedAt : '2022-09-16T03:41:11.979Z',
    }],
    rc:[{
      date : '2022-09-12T00:00:00.000Z',
      status : 0,
      pendingType: null,
      reason : null,
      memo : '4129889',
      createdAt : '2022-09-16T03:41:11.979Z',
      updatedAt : '2022-09-16T03:41:11.979Z',
    },{
      date : '2022-09-13T00:00:00.000Z',
      status : 0,
      pendingType: null,
      reason : null,
      memo : '55678',
      createdAt : '2022-09-16T03:41:11.979Z',
      updatedAt : '2022-09-16T03:41:11.979Z',
    }],
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
      companyId: testCompanyData[1]._id
    }
    query = {
      caseService: "HC"
    }
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位檢查', () => {
    test('[400:10010] 個案Id空白', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      delete _data.caseId;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10010, '個案Id空白');
      done();
    });
  })

  describe('資料規則驗證', () => {
    test('[400:20023] 日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.hc[0].date = '100年5月1日';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20023, '日期格式有誤');
      done();
    });

    test('[400:20023] 日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.dc[0].createdAt = '100年5月1日';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20023, '日期格式有誤');
      done();
    });

    test('[400:20023] 日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.rc[1].updatedAt = '100年5月1日';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20023, '日期格式有誤');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 創建個案-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, createObj);
      const { caseId } = createObj;

      const caseCol = NativeDBClient.getCollection(modelCodes.CASESTATUSHISTORY);
      const caseRes = await caseCol.findOne({ caseId: new ObjectId(caseId) });
      delete caseRes.hc[0]._id;
      expect(res.status).toBe(200);
      expect(JSON.stringify(caseRes.hc)).toBe(JSON.stringify(createObj.hc))
      done();
    });
  });
})
