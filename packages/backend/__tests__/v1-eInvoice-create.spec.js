const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testEInvoiceData = require('./seeder/data/eInvoice.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('新增電子發票', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/eInvoices';
  let agent;
  let headers;
  const data = {
    companyId: '6209f7102dde25cae862482d',
    serialString: 'ABC-20220309-005',
    caseId: '000000626eb2351d2e140001',
    identifier: '43887534',
    note: 'zzz',
    vat: true,
    invType: '07',
    taxType: 1,
    amount: 600,
    customer: {
      name: '金貝貝',
      address: '台北市內湖區瑞光路585號',
      mobile: '0123456789',
      email: 'compalTest@compaltest.com'
    },
    items: [
      {
        name: '日照上半日服務A',
        count: 1,
        word: '次',
        price: 600,
        taxType: 1,
        amount: 600,
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
    test('[400:11102] 公司ID空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.companyId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11102, '公司ID空白');
      done();
    });
    test('[400:10010] 個案Id空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.caseId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 10010, '個案Id空白');
      done();
    });
    test('[400:11614] 發票結帳編號空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.serialString = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11614, '發票結帳編號空白');
      done();
    });
    test('[400:11602] 字軌類別空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.invType = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11602, '字軌類別空白');
      done();
    });
    test('[400:11603] 課稅類別空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.taxType = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11603, '課稅類別空白');
      done();
    });
    test('[400:11611] 發票商品名稱空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.items[0].name = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11611, '發票商品名稱空白');
      done();
    });
    test('[400:11612] 發票商品單位空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.items[0].word = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11612, '發票商品單位空白');
      done();
    });
    test('[400:11605] 通關方式類別空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.taxType = 2;
      _data.clearanceMark = null;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11605, '通關方式類別空白');
      done();
    });
    test('[400:11604] 特種稅額類別空白', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.taxType = 4;
      _data.specialTaxType = null;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11604, '特種稅額類別空白');
      done();
    });
    test('[400:21602] 字軌類別不存在', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.invType = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21602, '字軌類別不存在');
      done();
    });
    test('[400:21603] 課稅類別不存在', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.taxType = 9999;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21603, '課稅類別不存在');
      done();
    });
    test('[400:21606] 商品單價是否含稅格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.vat = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21606, '商品單價是否含稅格式有誤');
      done();
    });
    test('[400:21607] 發票金額格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.amount = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21607, '發票金額格式有誤');
      done();
    });
    test('[400:21620] 客戶統一編號格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.identifier = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21620, '客戶統一編號格式有誤');
      done();
    });
    test('[400:21612] 發票商品數量格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.items[0].count = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21612, '發票商品數量格式有誤');
      done();
    });
    test('[400:21613] 發票商品單價格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.items[0].price = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21613, '發票商品單價格式有誤');
      done();
    });
    test('[400:21614] 發票商品合計格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.items[0].amount = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21614, '發票商品合計格式有誤');
      done();
    });
    test('[400:21605] 通關方式類別不存在', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.taxType = 2;
      _data.clearanceMark = 9999;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21605, '通關方式類別不存在');
      done();
    });
    test('[400:21604] 特種稅額類別不存在', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.taxType = 4;
      _data.specialTaxType = 9999;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
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
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21616, '發票商品課稅類別零稅率及免稅不可並存');
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21618] 發票結帳編號已存在', async (done) => {
      const _data = lodash.cloneDeep(data)
      _data.serialString = testEInvoiceData[0].serialString;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21618, '發票結帳編號已存在');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 新增電子發票-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      const eInvoiceCol = NativeDBClient.getCollection(modelCodes.EINVOICE);
      const obj = await eInvoiceCol.findOne({ serialString: data.serialString, valid: true });

      expect(res.status).toBe(200);
      expect(obj.companyId.toString()).toBe(data.companyId);
      expect(obj.caseId.toString()).toBe(data.caseId);
      expect(obj.identifier).toBe(data.identifier);
      expect(obj.note).toBe(data.note);
      expect(obj.vat).toBe(data.vat);
      expect(obj.invType).toBe(data.invType);
      expect(obj.taxType).toBe(data.taxType);
      expect(obj.customer).toEqual(data.customer);
      expect(obj.items).toEqual(data.items);
      done();
    });
  });
});
