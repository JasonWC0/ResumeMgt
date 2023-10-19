const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testCaseServiceContractData = require('./seeder/data/case-service-contract.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('編輯個案合約', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/caseServiceContracts';
  let agent;
  let headers;
  const data = {
    companyId: testCompanyData[0]._id.toString(),
    caseId: '638f1427a6f04e8c0e6f97e1',
    service: 'HC',
    principal: '王兒子',
    startDate: '2022/09/25',
    endDate: '2022/12/29',
    file: {
      id: 'fileId',
      fileName: '新檔案名.pdf',
      publicUrl: 'https://路徑',
      mimeType: '.pdf',
    }
  }

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
    test('[400:11102] 公司ID空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.companyId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11102, '公司ID空白');
      done();
    });
    test('[400:10010] 個案Id空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.caseId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 10010, '個案Id空白');
      done();
    });
    test('[400:11503] 合約服務類型空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.service = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11503, '合約服務類型空白');
      done();
    });
    test('[400:20025] 服務類型資料有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.service = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 20025, '服務類型資料有誤');
      done();
    });
    test('[400:10019] 開始日期空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.startDate = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 10019, '開始日期空白');
      done();
    });
    test('[400:20009] 開始日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.startDate = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 20009, '開始日期格式有誤');
      done();
    });
    test('[400:20010] 結束日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.endDate = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 20010, '結束日期格式有誤');
      done();
    });
    test('[400:10013] 檔案Id空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.file.id = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 10013, '檔案Id空白');
      done();
    });
    test('[400:10014] 檔案路徑空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.file.publicUrl = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 10014, '檔案路徑空白');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 讀取個案合約列表-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);

      const caseServiceContractCol = NativeDBClient.getCollection(modelCodes.CASESERVICECONTRACT);
      const caseServiceContractData = await caseServiceContractCol.findOne({ caseId: ObjectId(data.caseId)});

      expect(res.status).toBe(200);
      expect(caseServiceContractData.principal).toBe(data.principal);
      expect(new Date(caseServiceContractData.startDate)).toEqual(new Date(data.startDate));
      expect(new Date(caseServiceContractData.endDate)).toEqual(new Date(data.endDate));
      expect(caseServiceContractData.file.id).toBe(data.file.id);
      expect(caseServiceContractData.file.fileName).toBe(data.file.fileName);
      expect(caseServiceContractData.file.publicUrl).toBe(data.file.publicUrl);
      expect(caseServiceContractData.file.mimeType).toBe(data.file.mimeType);
      done();
    });
  });
});