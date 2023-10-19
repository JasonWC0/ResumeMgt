const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const companyData = require('./seeder/data/company.json');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');


describe('創建個案收據設定', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/receiptSettings';
  let agent;
  let loginData;
  let headers;
  const createTextData = {
    companyId: companyData.data[1]._id,
    contentType: 0,
    pos: '${test_1}',
    text: 'ut',
    note: 'note',
    reportType: 'CaseReceipt',
  };
  const createPhotoData = {
    companyId: companyData.data[1]._id,
    contentType: 1,
    pos: '${test_2}',
    photo: {
      id: 'id',
      publicUrl: 'aaa/bbb/ccc.txt',
    },
    note: 'note',
    reportType: 'CaseReceipt',
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
      const _data = lodash.cloneDeep(createTextData);
      delete _data.companyId;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 11102, '公司ID空白');
      done();
    })

    test('[400:11122] 文字內容空白', async (done) => {
      const _data = lodash.cloneDeep(createTextData);
      delete _data.text;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 11122, '文字內容空白');
      done();
    })

    test('[400:11124] 檔案空白', async (done) => {
      const _data = lodash.cloneDeep(createPhotoData);
      delete _data.photo;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 11124, '檔案空白');
      done();
    })
  })

  describe('成功', () => {
    let receiptSettingCol;
    beforeAll(async () => {
      receiptSettingCol = NativeDBClient.getCollection(modelCodes.RECEIPTSETTING);
    })
    test('[200] 創建個案收據設定-文字內容-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, createTextData);
      const oReceiptSetting = await receiptSettingCol.findOne({
        companyId: ObjectId(companyData.data[1]._id),
        pos: createTextData.pos
      });
      expect(res.status).toBe(200);
      expect(oReceiptSetting.pos).toBe(createTextData.pos);
      expect(oReceiptSetting.text).toBe(createTextData.text);
      expect(oReceiptSetting.__vn).toBe(0);
      expect(oReceiptSetting.__sc).toBe('Erpv3');
      done();
    })

    test('[200] 創建個案收據設定-圖片內容-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, createPhotoData);
      const oReceiptSetting = await receiptSettingCol.findOne({
        companyId: ObjectId(companyData.data[1]._id),
        pos: createPhotoData.pos
      });
      expect(res.status).toBe(200);
      expect(oReceiptSetting.pos).toBe(createPhotoData.pos);
      expect(oReceiptSetting.photo.id).toBe(createPhotoData.photo.id);
      expect(oReceiptSetting.__vn).toBe(0);
      expect(oReceiptSetting.__sc).toBe('Erpv3');
      done();
    });
  });
})
