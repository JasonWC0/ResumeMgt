const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testEInvoiceData = require('./seeder/data/eInvoice.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('編輯電子發票', () => {
  const METHOD = 'PATCH';
  const _ENDPOINT = '/main/app/api/v1/eInvoices';
  let agent;
  let headers;
  const data = {
    identifier: '43997534',
    note: 'zzz',
    vat: true,
    invType: '07',
    taxType: 1,
    amount: 1000,
    donation: true,
    npoCode: "1236",
    carrierType: 3,
    carrierNum: '/8BD23MS',
    customer: {
      name: '金貝貝',
      address: '台北市內湖區瑞光路585號5樓',
      mobile: '0912500345',
      email: 'compalTest@compaltest.com'
    },
    items: [
      {
        name: '日照上半日服務A',
        count: 2,
        word: '次',
        price: 500,
        taxType: 1,
        amount: 1000,
        note: ''
      }
    ],
  };

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    const loginData = await Base.login(agent);
    headers = {
      Authorization: `Bearer ${loginData.token}`,
      vn: 0,
      sc: 'Erpv3',
      companyId: testCompanyData[0]._id
    }

    testEInvoiceData.forEach((d, index, array) => {
      array[index]._id = ObjectId(d._id);
      array[index].companyId = ObjectId(d.companyId);
      array[index].caseId = ObjectId(d.caseId);
      array[index].creator = ObjectId(d.creator);
      array[index].modifier = ObjectId(d.modifier);
      if (d.issuedDate !== '') {
        array[index].issuedDate = new Date(d.issuedDate);
      }
      array[index].createdAt = new Date(d.createdAt);
      array[index].updatedAt = new Date(d.updatedAt);
    });
    const eInvoiceCol = NativeDBClient.getCollection(modelCodes.EINVOICE);
    await eInvoiceCol.insertMany(testEInvoiceData);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:11602] 字軌類別空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.invType = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 11602, '字軌類別空白');
      done();
    });
    test('[400:11603] 課稅類別空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.taxType = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 11603, '課稅類別空白');
      done();
    });
    test('[400:11611] 發票商品名稱空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.items[0].name = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 11611, '發票商品名稱空白');
      done();
    });
    test('[400:11612] 發票商品單位空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.items[0].word = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 11612, '發票商品單位空白');
      done();
    });
    test('[400:11605] 通關方式類別空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.taxType = 2;
      _data.clearanceMark = null;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 11605, '通關方式類別空白');
      done();
    });
    test('[400:11604] 特種稅額類別空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.taxType = 4;
      _data.specialTaxType = null;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 11604, '特種稅額類別空白');
      done();
    });
    test('[400:11606] 捐贈碼空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.npoCode = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 11606, '捐贈碼空白');
      done();
    });
    test('[400:11607] 載具編號空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.carrierNum = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 11607, '載具編號空白');
      done();
    });
    test('[400:21602] 字軌類別不存在', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.invType = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 21602, '字軌類別不存在');
      done();
    });
    test('[400:21603] 課稅類別不存在', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.taxType = 9999;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 21603, '課稅類別不存在');
      done();
    });
    test('[400:21606] 商品單價是否含稅格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.vat = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 21606, '商品單價是否含稅格式有誤');
      done();
    });
    test('[400:21607] 發票金額格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.amount = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 21607, '發票金額格式有誤');
      done();
    });
    test('[400:21620] 客戶統一編號格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.identifier = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 21620, '客戶統一編號格式有誤');
      done();
    });
    test('[400:21612] 發票商品數量格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.items[0].count = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 21612, '發票商品數量格式有誤');
      done();
    });
    test('[400:21613] 發票商品單價格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.items[0].price = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 21613, '發票商品單價格式有誤');
      done();
    });
    test('[400:21614] 發票商品合計格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.items[0].amount = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 21614, '發票商品合計格式有誤');
      done();
    });
    test('[400:21605] 通關方式類別不存在', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.taxType = 2;
      _data.clearanceMark = 9999;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 21605, '通關方式類別不存在');
      done();
    });
    test('[400:21604] 特種稅額類別不存在', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.taxType = 4;
      _data.specialTaxType = 9999;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 21604, '特種稅額類別不存在');
      done();
    });
    test('[400:21616] 發票商品課稅類別零稅率及免稅不可並存', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.taxType = 9;
      _data.items = [
        {
          name: '日照上半日服務A',
          count: 1,
          word: '次',
          price: 600,
          taxType: 1,
          amount: 600,
          note: ''
        },
        {
          name: '日照上半日服務A',
          count: 1,
          word: '次',
          price: 600,
          taxType: 2,
          amount: 600,
          note: ''
        },
        {
          name: '日照上半日服務A',
          count: 1,
          word: '次',
          price: 600,
          taxType: 3,
          amount: 600,
          note: ''
        }
      ];
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 21616, '發票商品課稅類別零稅率及免稅不可並存');
      done();
    });
    test('[400:21608] 發票是否捐贈格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.donation = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 21608, '發票是否捐贈格式有誤');
      done();
    });
    test('[400:21609] 載具類別格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.carrierType = 9999;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 21609, '載具類別格式有誤');
      done();
    });
    test('[400:21621] 捐贈碼格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.npoCode = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 21621, '捐贈碼格式有誤');
      done();
    });
    test('[400:21610] 載具編號格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.carrierNum = 'test';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, _data);
      Base.verifyError(res, 21610, '載具編號格式有誤');
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21619] 發票已開立', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[1]._id}`, headers, data);
      Base.verifyError(res, 21619, '發票已開立');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 編輯電子發票-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testEInvoiceData[0]._id}`, headers, data);
      const eInvoiceCol = NativeDBClient.getCollection(modelCodes.EINVOICE);
      const obj = await eInvoiceCol.findOne({ _id: ObjectId(testEInvoiceData[0]._id) });

      expect(res.status).toBe(200);
      expect(obj.identifier).toBe(data.identifier);
      expect(obj.note).toBe(data.note);
      expect(obj.vat).toBe(data.vat);
      expect(obj.invType).toBe(data.invType);
      expect(obj.taxType).toBe(data.taxType);
      expect(obj.amount).toBe(data.amount);
      expect(obj.donation).toBe(data.donation);
      expect(obj.npoCode).toBe(data.npoCode);
      expect(obj.carrierType).toBe(data.carrierType);
      expect(obj.carrierNum).toBe(data.carrierNum);
      expect(obj.customer).toEqual(data.customer);
      expect(obj.items).toEqual(data.items);
      done();
    });
  });
});