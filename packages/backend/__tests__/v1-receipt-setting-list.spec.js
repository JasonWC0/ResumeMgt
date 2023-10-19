const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const companyData = require('./seeder/data/company.json');
const receiptSettingData = require('./seeder/data/receiptSetting.json');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');


describe('取得公司個案收據列表', () => {
  const METHOD = 'GET';
  const _ENDPOINT = `/main/app/api/v1/receiptSettings`;
  let agent;
  let loginData;
  let headers;
  const query = {
    companyId: companyData.data[0]._id,
  };
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
      companyId: companyData.data[1]._id
    }
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位檢查', () => {
    test('[400:11102] 公司ID空白', async (done) => {
      const _data = lodash.cloneDeep(query);
      delete _data.companyId;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, _data);
      Base.verifyError(res, 11102, '公司ID空白');
      done();
    })
  })

  describe('成功', () => {
    test('[200] 查詢公司個案收據列表-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);
      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(2);
      done();
    })

    test('[200] 查詢公司個案收據列表-篩選報告類型-成功', async (done) => {
      query.reportType = receiptSettingData.data[0].reportType;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);
      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(1);
      done();
    })
  });
})
