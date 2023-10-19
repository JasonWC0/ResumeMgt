const request = require('supertest');
const NativeDBClient = require('./basic/native-db-client');
const serviceItemData = require('./seeder/data/serviceItem.json');
const Base = require('./basic/basic');
const App = require('../app');


describe('取得單項服務項目', () => {
  const _ENDPOINT = '/main/app/api/v1/serviceItems';
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

  describe('驗證規則', () => {
    test('[400:20101] 查詢不到此項目', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}/fake-service-item`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

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
    test('[200] 取得單項服務項目-成功', async (done) => {
      const iServiceItem = serviceItemData.data[0];
      const res = await agent
        .get(`${_ENDPOINT}/${iServiceItem._id}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      expect(res.body.result.serviceName).toBe(iServiceItem.serviceName);
      expect(res.body.result.timeRequired).toBe(iServiceItem.timeRequired);
      expect(res.body.result.serviceOption).toMatchObject(iServiceItem.serviceOption);
      expect(res.body.result.vn).toBe(0);
      done();
    });
  });
})
