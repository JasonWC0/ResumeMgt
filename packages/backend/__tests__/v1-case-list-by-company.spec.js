const request = require('supertest');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const companyData = require('./seeder/data/company.json');

describe('取得公司個案列表', () => {
  const _ENDPOINT = '/main/app/api/v1/cases';
  let agent;
  let loginData;
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

  describe('需求欄位檢查', () => {
    test('[400:90009] 公司ID空白', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: ''
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 90009,
        message: 'Headers incomplete',
        result: null,
      });
      done();
    })
  })

  describe('成功', () => {
    test('[200] 取得公司個案列表-成功', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: companyData.data[0]._id,
        })
        .query({ serviceCategory: 'HC,DC,RC,ACM', detail: 'foodFile' });

      expect(res.status).toBe(200);
      expect(res.body.result.list).toHaveLength(2);
      done();
    });
  });
})
