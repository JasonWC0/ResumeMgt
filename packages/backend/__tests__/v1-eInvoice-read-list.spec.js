const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testEInvoiceData = require('./seeder/data/eInvoice.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('讀取電子發票列表', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/eInvoices';
  let agent;
  let headers;

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
    test('[400:10008] 略過筆數空白', async (done) => {
      const q = { status: '0,1,2', dateType: 'p', sDate: '2023/01/01', eDate:'2023/03/31', skip: null, limit: 10 }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 10008, '略過筆數空白');
      done();
    });
    test('[400:10009] 取得筆數空白', async (done) => {
      const q = { status: '0,1,2', dateType: 'p', sDate: '2023/01/01', eDate:'2023/03/31', skip: 0, limit: null }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 10009, '取得筆數空白');
      done();
    });
    test('[400:11600] 電子發票狀態空白', async (done) => {
      const q = { status: '', dateType: 'p', sDate: '2023/01/01', eDate:'2023/03/31', skip: 0, limit: 10 }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 11600, '電子發票狀態空白');
      done();
    });
    test('[400:21600] 電子發票狀態不存在', async (done) => {
      const q = { status: '0,1,test', dateType: 'p', sDate: '2023/01/01', eDate:'2023/03/31', skip: 0, limit: 10 }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 21600, '電子發票狀態不存在');
      done();
    });
    test('[400:11601] 電子發票日期類型空白', async (done) => {
      const q = { status: '0,1,2', dateType: '', sDate: '2023/01/01', eDate:'2023/03/31', skip: 0, limit: 10 }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 11601, '電子發票日期類型空白');
      done();
    });
    test('[400:21601] 電子發票日期類型不存在', async (done) => {
      const q = { status: '0,1,2', dateType: 'kkk', sDate: '2023/01/01', eDate:'2023/03/31', skip: 0, limit: 10 }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 21601, '電子發票日期類型不存在');
      done();
    });
    test('[400:10019] 開始日期空白', async (done) => {
      const q = { status: '0,1,2', dateType: 'p', sDate: '', eDate:'2023/03/31', skip: 0, limit: 10 }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 10019, '開始日期空白');
      done();
    });
    test('[400:10020] 結束日期空白', async (done) => {
      const q = { status: '0,1,2', dateType: 'p', sDate: '2023/03/01', eDate:'', skip: 0, limit: 10 }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 10020, '結束日期空白');
      done();
    });
    test('[400:20009] 開始日期格式有誤', async (done) => {
      const q = { status: '0,1,2', dateType: 'p', sDate: 'TEST', eDate:'2023/03/31', skip: 0, limit: 10 }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 20009, '開始日期格式有誤');
      done();
    });
    test('[400:20010] 結束日期格式有誤', async (done) => {
      const q = { status: '0,1,2', dateType: 'p', sDate: '2023/03/01', eDate:'TEST', skip: 0, limit: 10 }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 20010, '結束日期格式有誤');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 讀取電子發票列表-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { status: '0,1,2', dateType: 'p', sDate: '2023/01/01', eDate:'2023/03/31', skip: 0, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(4);
      expect(res.body.result.list[0].caseName).toBe('金貝貝');
      done();
    });
    test('[200] 讀取電子發票列表(filter 狀態)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { status: '1', dateType: 'p', sDate: '2023/01/01', eDate:'2023/03/31', skip: 0, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(1);
      expect(res.body.result.list[0].caseName).toBe('金貝貝');
      expect(res.body.result.list[0].serialString).toBe(testEInvoiceData[1].serialString);
      expect(res.body.result.list[0].invoiceNumber).toBe(testEInvoiceData[1].invoiceNumber);
      expect(res.body.result.list[0].note).toBe(testEInvoiceData[1].note);
      expect(res.body.result.list[0].status).toBe(testEInvoiceData[1].status);
      expect(res.body.result.list[0].items).toEqual(testEInvoiceData[1].items);
      done();
    });
    test('[200] 讀取電子發票列表(filter 開立日期)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { status: '0,1,2', dateType: 'i', sDate: '2023/02/01', eDate:'2023/02/28', skip: 0, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(1);
      expect(res.body.result.list[0].caseName).toBe('金貝貝');
      expect(res.body.result.list[0].serialString).toBe(testEInvoiceData[2].serialString);
      expect(res.body.result.list[0].invoiceNumber).toBe(testEInvoiceData[2].invoiceNumber);
      expect(res.body.result.list[0].note).toBe(testEInvoiceData[2].note);
      expect(res.body.result.list[0].status).toBe(testEInvoiceData[2].status);
      expect(res.body.result.list[0].items).toEqual(testEInvoiceData[2].items);
      done();
    });
  });
});