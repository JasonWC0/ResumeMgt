const request = require('supertest');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const modelCodes = require('./enums/model-codes');
const employmentHistoryData = require('./seeder/data/employmentHistory.json');
const ObjectID = require('mongodb').ObjectID;

describe('更新職務歷史', () => {
  const _ENDPOINT = '/main/app/api/v1/employmentHistories';
  let agent;
  let loginData;
  const companyId = employmentHistoryData.data[0].companyId;
  let insertData;
  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    const emplymentHistoryCol = NativeDBClient.getCollection(modelCodes.EMPLOYMENTHISTORY);
     insertData = employmentHistoryData.data[0];
    const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
    const op = await personCol.findOne({});
    insertData.personId = op._id;
    insertData.companyId = ObjectID(insertData.companyId);
    insertData._id = ObjectID(insertData._id);
    await emplymentHistoryCol.insertOne(insertData);
    agent = request.agent(new App().app);
    loginData = await Base.login(agent);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('資料規則驗證', () => {
    test('[400:10508] 公司不存在', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        })
        .query({ personId: insertData.personId.toString() });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21121,
        message: '公司不存在',
        result: null,
      });
      done();
    });

    test('[400:10508] 人員不存在', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: companyId
        })
        .query({ personId: 'fakePerosonId' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20106,
        message: '人員不存在',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[取得人員公司職務歷史資料: 成功]', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId
        })
        .query({ personId: insertData.personId.toString() });
      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(1);
      done();
    });
  });
})
