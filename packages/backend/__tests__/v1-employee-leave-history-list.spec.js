const request = require('supertest');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const modelCodes = require('./enums/model-codes');
const employeeLeaveHistoryData = require('./seeder/data/employee-leave-history.json');
const ObjectID = require('mongodb').ObjectID;

describe('更新請假歷史紀錄', () => {
  const _ENDPOINT = '/main/app/api/v1/leaves/history';
  let agent;
  let loginData;
  const companyId = employeeLeaveHistoryData.data[0].companyId;
  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

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
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21121,
        message: '公司不存在',
        result: null,
      });
      done();
    });

    test('[400:20009] 開始日期格式有誤', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: companyId
        })
        .query({ startDate: '100年1月1日' });

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
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: companyId
        })
        .query({ endDate: '100年1月1日' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20010,
        message: '結束日期格式有誤',
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
        });
      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(4);
      expect(res.body.result.list).toHaveLength(4);
      done();
    });

    test('[取得人員公司職務歷史資料: 成功 - 取得1筆]', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId
        })
        .query({ limit: 1 });
      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(4);
      expect(res.body.result.list).toHaveLength(1);
      done();
    });

    test('[取得人員公司職務歷史資料: 成功 - 略過2筆]', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId
        })
        .query({ skip: 2 });
      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(4);
      expect(res.body.result.list).toHaveLength(2);
      done();
    });

    test('[取得人員公司職務歷史資料: 成功 - 狀態為銷假]', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId
        })
        .query({ status: 1 });
      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(1);
      expect(res.body.result.list).toHaveLength(1);
      done();
    });

    test('[取得人員公司職務歷史資料: 成功 - 篩選開始時間]', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId
        })
        .query({ startDate: '2023/01/05' });
      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(1);
      expect(res.body.result.list).toHaveLength(1);
      done();
    });

    test('[取得人員公司職務歷史資料: 成功 - 篩選結束時間]', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId
        })
        .query({ endDate: '2023/01/04' });
      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(3);
      expect(res.body.result.list).toHaveLength(3);
      done();
    });
  });
})
