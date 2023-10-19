const request = require('supertest');
const lodash = require('lodash');
const NativeDBClient = require('./basic/native-db-client');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const Base = require('./basic/basic');
const App = require('../app');
const caseData = require('./seeder/data/case.json');
const testCompanyData = require('./seeder/data/company.json').data;

describe('新增個案服務', () => {
  const METHOD = 'POST';
  const _ENDPOINT = `/main/app/api/v1/cases/${caseData.data[0]._id}`;
  let agent;
  let loginData;
  let headers;
  let serviceObj;
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
      cc: 'abc',
      companyId: testCompanyData[1]._id
    };
    serviceObj = {
      "caseNumber": "HC002",
      "height": 157.8,
      "weight": 62,
      "calfGirth": 32,
      "category": "居家照護",
      "source": 2,
      "medicalRecordNumber": "SA-0002",
      "reliefType": 2,
      "livingArrangement": 3,
      "syncVitalSignToDM": false,
      "livingWith": [
        2
      ],
      "billPlaceType": 0,
      "billPlace": {
        "postalCode": "114",
        "city": "台北市",
        "region": "內湖區",
        "village": "西湖里",
        "neighborhood": 1,
        "road": "瑞光路",
        "others": "585號"
      },
      "billNote": "帳單來點備註",
      "pipelineService": [],
      "startDate": "2022/06/27",
      "endDate": null,
      "supervisorId": null,
      "subSupervisorId": null,
      "masterHomeservicerId": null,
      "careAttendantId": null,
      "locationName": null,
      "outboundDriverId": null,
      "inboundDriverId": null,
      "outboundShuttleOwnExpenseItem": null,
      "inboundShuttleOwnExpenseItem": null,
      "rcServiceItem": null,
      "scheduledStartDate": null,
      "scheduledEndDate": null,
      "roomType": null,
      "roomNo": null,
      "bedNo": null,
      "importDate": null,
      "caseManagerId": null,
      "subCaseManagerId": null,
      "careManagerId": null
    };
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位檢查', () => {
    test('[400:10302] 帳單地址類型空白', async (done) => {
      const _obj = lodash.cloneDeep(serviceObj);
      _obj.billPlaceType = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/HC`, headers, _obj);
      Base.verifyError(res, 10302, '帳單地址類型空白');
      done();
    });
    test('[400:10303] 居住狀況空白', async (done) => {
      const _obj = lodash.cloneDeep(serviceObj);
      _obj.livingArrangement = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/HC`, headers, _obj);
      Base.verifyError(res, 10303, '居住狀況空白');
      done();
    });
    test('[400:20317] 帳單地址類型資料有誤', async (done) => {
      const _obj = lodash.cloneDeep(serviceObj);
      _obj.billPlaceType = 9999;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/HC`, headers, _obj);
      Base.verifyError(res, 20317, '帳單地址類型資料有誤');
      done();
    });
    test('[400:20317] 居住狀況資料有誤', async (done) => {
      const _obj = lodash.cloneDeep(serviceObj);
      _obj.livingArrangement = 9999;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/HC`, headers, _obj);
      Base.verifyError(res, 20318, '居住狀況資料有誤');
      done();
    });
  })

  describe('資料規則驗證', () => {
    test('[400:20312] 個案服務已存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/DC`, headers, serviceObj);
      Base.verifyError(res, 20312, '個案服務已存在');
      done();
    });
  })

  describe('成功', () => {
    test('[200] 創建個案服務-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/HC`, headers, serviceObj);
      expect(res.status).toBe(200);

      const caseCol = NativeDBClient.getCollection(modelCodes.CASE);
      const caseRes = await caseCol.findOne({ _id: new ObjectId(caseData.data[0]._id) });
      expect(caseRes.hc).toBeTruthy();
      done();
    });
  });
})
