const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testCaseServiceContractData = require('./seeder/data/case-service-contract.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('讀取個案合約列表', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/caseServiceContracts';
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

    testCaseServiceContractData.forEach((d, index, array) => {
      array[index]._id = ObjectId(d._id);
      array[index].companyId = ObjectId(d.companyId);
      array[index].caseId = ObjectId(d.caseId);
      array[index].startDate = new Date(d.startDate);
      if (d.endDate) {
        array[index].endDate = new Date(d.endDate);
      }
      array[index].file.updatedAt = new Date(d.file.updatedAt);
    });
    const caseServiceContractCol = NativeDBClient.getCollection(modelCodes.CASESERVICECONTRACT);
    await caseServiceContractCol.insertMany(testCaseServiceContractData);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:10008] 略過筆數空白', async (done) => {
      const q = { skip: null, limit: 10 };
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 10008, '略過筆數空白');
      done();
    });
    test('[400:10009] 取得筆數空白', async (done) => {
      const q = { skip: 0, limit: null };
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 10009, '取得筆數空白');
      done();
    });
    test('[400:20025] 服務類型資料有誤', async (done) => {
      const q = { service: 'test', skip: 0, limit: 10 };
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 20025, '服務類型資料有誤');
      done();
    });
    test('[400:11500] 合約起始日，範圍搜尋起始日空白', async (done) => {
      const q = { sDateF:'', sDateE: '2022/10/01', skip: 0, limit: 10 };
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 11500, '合約起始日，範圍搜尋起始日空白');
      done();
    });
    test('[400:11501] 合約起始日，範圍搜尋結束日空白', async (done) => {
      const q = { sDateF:'2022/10/01', sDateE: '', skip: 0, limit: 10 };
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 11501, '合約起始日，範圍搜尋結束日空白');
      done();
    });
    test('[400:21500] 合約起始日，範圍搜尋起始日格式有誤', async (done) => {
      const q = { sDateF:'test', sDateE: '2022/10/01', skip: 0, limit: 10 };
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 21500, '合約起始日，範圍搜尋起始日格式有誤');
      done();
    });
    test('[400:21501] 合約起始日，範圍搜尋結束日格式有誤', async (done) => {
      const q = { sDateF:'2022/10/01', sDateE: 'test', skip: 0, limit: 10 };
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 21501, '合約起始日，範圍搜尋結束日格式有誤');
      done();
    });
    test('[400:11502] 合約結束日，範圍搜尋起始日空白', async (done) => {
      const q = { eDateF:'', eDateE: '2022/10/01', skip: 0, limit: 10 };
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 11502, '合約結束日，範圍搜尋起始日空白');
      done();
    });
    test('[400:11503] 合約結束日，範圍搜尋結束日空白', async (done) => {
      const q = { eDateF:'2022/10/01', eDateE: '', skip: 0, limit: 10 };
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 11503, '合約結束日，範圍搜尋結束日空白');
      done();
    });
    test('[400:21502] 合約結束日，範圍搜尋起始日格式有誤', async (done) => {
      const q = { eDateF:'test', eDateE: '2022/10/01', skip: 0, limit: 10 };
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 21502, '合約結束日，範圍搜尋起始日格式有誤');
      done();
    });
    test('[400:21503] 合約結束日，範圍搜尋結束日格式有誤', async (done) => {
      const q = { eDateF:'2022/10/01', eDateE: 'test', skip: 0, limit: 10 };
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, q);
      Base.verifyError(res, 21503, '合約結束日，範圍搜尋結束日格式有誤');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 讀取個案合約列表-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { skip: 0, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(2);
      expect(res.body.result.list[0].caseName).toBe('金貝貝');
      done();
    });
    test('[200] 讀取個案合約列表(query service)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { service: 'DC', skip: 0, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(1);
      expect(res.body.result.list[0].caseName).toBe('金貝貝');
      expect(res.body.result.list[0].contracts[0].principal).toBe(testCaseServiceContractData[1].principal);
      expect(new Date(res.body.result.list[0].contracts[0].startDate)).toEqual(new Date(testCaseServiceContractData[1].startDate));
      expect(res.body.result.list[0].contracts[0].file.id).toBe(testCaseServiceContractData[1].file.id);
      expect(res.body.result.list[0].contracts[0].file.fileName).toBe(testCaseServiceContractData[1].file.fileName);
      expect(res.body.result.list[0].contracts[0].file.publicUrl).toBe(testCaseServiceContractData[1].file.publicUrl);
      expect(new Date(res.body.result.list[0].contracts[0].file.updatedAt)).toEqual(new Date(testCaseServiceContractData[1].file.updatedAt));
      expect(res.body.result.list[0].contracts[0].file.mimeType).toBe(testCaseServiceContractData[1].file.mimeType);
      done();
    });
    test('[200] 讀取個案合約列表(query caseName)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { caseName: '金貝', skip: 0, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(2);
      expect(res.body.result.list[0].caseName).toBe('金貝貝');
      done();
    });
    test('[200] 讀取個案合約列表(query principal)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { principal: '張', skip: 0, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(1);
      expect(res.body.result.list[0].caseName).toBe('金貝貝');
      expect(res.body.result.list[0].contracts[0].principal).toBe(testCaseServiceContractData[0].principal);
      expect(new Date(res.body.result.list[0].contracts[0].startDate)).toEqual(new Date(testCaseServiceContractData[0].startDate));
      expect(new Date(res.body.result.list[0].contracts[0].endDate)).toEqual(new Date(testCaseServiceContractData[0].endDate));
      expect(res.body.result.list[0].contracts[0].file.id).toBe(testCaseServiceContractData[0].file.id);
      expect(res.body.result.list[0].contracts[0].file.fileName).toBe(testCaseServiceContractData[0].file.fileName);
      expect(res.body.result.list[0].contracts[0].file.publicUrl).toBe(testCaseServiceContractData[0].file.publicUrl);
      expect(new Date(res.body.result.list[0].contracts[0].file.updatedAt)).toEqual(new Date(testCaseServiceContractData[0].file.updatedAt));
      expect(res.body.result.list[0].contracts[0].file.mimeType).toBe(testCaseServiceContractData[0].file.mimeType);
      done();
    });
    test('[200] 讀取個案合約列表(query startDate)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { sDateF: '2022/10/01', sDateE: '2022/11/01', skip: 0, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.result.total).toBe(1);
      expect(res.body.result.list[0].contracts).toHaveLength(2);
      done();
    });
    test('[200] 讀取個案合約列表(query endDate)-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { eDateF: '2022/11/01', eDateE: '2022/12/01', skip: 0, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.result.list[0].contracts).toHaveLength(1);
      done();
    });
  });
});