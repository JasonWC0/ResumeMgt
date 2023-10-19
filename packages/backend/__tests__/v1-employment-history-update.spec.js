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
  const employmentHistoryId = employmentHistoryData.data[0]._id;
  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    const emplymentHistoryCol = NativeDBClient.getCollection(modelCodes.EMPLOYMENTHISTORY);
    const insertData = employmentHistoryData.data[0];
    insertData._id = ObjectID(insertData._id);
    insertData.companyId = ObjectID(insertData.companyId);
    insertData.personId = ObjectID(insertData.personId);
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

  describe('需求欄位檢查', () => {
    test('[400:10508] 填寫日期空白', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/${employmentHistoryId}`)
        .send({
          status: 1,
        })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10508,
        message: '填寫日期空白',
        result: null,
      });
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:10508] 填寫日期格式錯誤', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/${employmentHistoryId}`)
        .send({
          date: "yyyy/mm/dd",
          status: 1,
        })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20505,
        message: '填寫日期格式有誤',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[更新職務歷史資料: 成功]', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/${employmentHistoryId}`)
        .send({
          date: '2025/01/01',
          status: 1,
        })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });
      expect(res.status).toBe(200);
      done();
    });
  });
})
