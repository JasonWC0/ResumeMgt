const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testCaseServiceContractData = require('./seeder/data/case-service-contract.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('讀取個案合約', () => {
  const METHOD = 'DELETE';
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
    test('[400:20019] 欲刪除項目Id不符合', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/test`, headers);
      Base.verifyError(res, 20019, '欲刪除項目Id不符合');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 讀取個案合約列表-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testCaseServiceContractData[0]._id}`, headers);

      const caseServiceContractCol = NativeDBClient.getCollection(modelCodes.CASESERVICECONTRACT);
      const caseServiceContractData = await caseServiceContractCol.findOne({ _id: ObjectId(testCaseServiceContractData[0]._id)});

      expect(res.status).toBe(200);
      expect(caseServiceContractData.valid).toBe(false);
      done();
    });
  });
});