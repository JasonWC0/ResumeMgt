const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testCaseServiceContractData = require('./seeder/data/case-service-contract.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('讀取個案合約', () => {
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

  describe('資料規則驗證', () => {
    test('[400:21504] 個案合約不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/test`, headers);
      Base.verifyError(res, 21504, '個案合約不存在');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 讀取個案合約列表-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testCaseServiceContractData[0]._id}`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result.principal).toBe(testCaseServiceContractData[0].principal);
      expect(new Date(res.body.result.startDate)).toEqual(new Date(testCaseServiceContractData[0].startDate));
      expect(new Date(res.body.result.endDate)).toEqual(new Date(testCaseServiceContractData[0].endDate));
      expect(res.body.result.file.id).toBe(testCaseServiceContractData[0].file.id);
      expect(res.body.result.file.fileName).toBe(testCaseServiceContractData[0].file.fileName);
      expect(res.body.result.file.publicUrl).toBe(testCaseServiceContractData[0].file.publicUrl);
      expect(new Date(res.body.result.file.updatedAt)).toEqual(new Date(testCaseServiceContractData[0].file.updatedAt));
      expect(res.body.result.file.mimeType).toBe(testCaseServiceContractData[0].file.mimeType);
      done();
    });
  });
});