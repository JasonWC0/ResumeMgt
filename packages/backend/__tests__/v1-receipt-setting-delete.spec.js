const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const companyData = require('./seeder/data/company.json');
const receiptSettingData = require('./seeder/data/receiptSetting.json');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');


describe('刪除單筆個案收據設定', () => {
  const receiptSettingId = receiptSettingData.data[0]._id;
  const METHOD = 'DELETE';
  const _ENDPOINT = `/main/app/api/v1/receiptSettings`;
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
    test('[404:90008] 無此個案收據設定', async (done) => {
      const fakeUrl = 'fakeUrl';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${fakeUrl}`, headers);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 90008,
        message: 'URI not found',
        result: null,
      });
      done();
    })
  })

  describe('成功', () => {
    let receiptSettingCol;
    beforeAll(async () => {
      receiptSettingCol = NativeDBClient.getCollection(modelCodes.RECEIPTSETTING);
    })
    test('[200] 刪除個案收據設定-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${receiptSettingId}`, headers);
      const oReceiptSetting = await receiptSettingCol.findOne({ _id: ObjectId(receiptSettingId) });
      expect(res.status).toBe(200);
      expect(oReceiptSetting.valid).toBeFalsy();
      done();
    })
  });
})
