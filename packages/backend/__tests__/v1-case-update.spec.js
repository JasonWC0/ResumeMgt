const request = require('supertest');
const lodash = require('lodash');
const NativeDBClient = require('./basic/native-db-client');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const Base = require('./basic/basic');
const App = require('../app');
const caseData = require('./seeder/data/case.json');
const testCompanyData = require('./seeder/data/company.json').data;
const customTools = require('./basic/custom-tools');
const { customerRoleCodes } = require('../../app-core/domain');

describe('更新個案', () => {
  const METHOD = 'PATCH';
  const _ENDPOINT = `/main/app/api/v1/cases/${caseData.data[0]._id}`;
  let agent;
  let loginData;
  let headers;
  const updObj = {
    name: '伊莉莎白',
    contacts: [{
      name: '維多利亞',
      relationship: '家族成員',
    }],
    healthFile: {
      cmsLevel: 1,
      disabilityCategoryType: 1,
      disabilityItem: 1,
    },
    foodFile: {
      meal: 2,
      processMethod: '細碎',
      mealSize: '80%',
      dessert: 1,
    },
      dc: {
      caseNumber: 'AA5AA',
      source: 1,
      reliefType: 1,
      pipelineService: [1],
      status: 1,
      scheduledStartDate: '2022/06/22',
      scheduledEndDate: '2022/06/23',
      importDate: '2022/06/20',
      startDate: '2022/06/22',
      endDate: '2022/06/23',
    },
    residencePlace: {
      lat : 123.0,
      long : 101.0,
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
    loginData = await Base.login(agent);
    headers = {
      Authorization: `Bearer ${loginData.token}`,
      vn: 0,
      sc: 'Erpv3',
      cc: 'abc',
      companyId: testCompanyData[1]._id
    }
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位檢查', () => {
    test('[404:90008] 無此個案', async (done) => {
      const fakeCaseId = '000000000000001d2e140001';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${fakeCaseId}`, headers, updObj);
      expect(res.status).toBe(404);
      done();
    });
  })

  describe('資料規則驗證', () => {
    test('[400:20134] 膳食不存在', async (done) => {
      const _data = lodash.cloneDeep(updObj);
      _data.foodFile.meal = -1;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20134, '膳食不存在');
      done();
    });

    test('[400:20409] CMS等級資料有誤', async (done) => {
      const _data = lodash.cloneDeep(updObj);
      _data.healthFile.cmsLevel = -1;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20409, 'CMS等級資料有誤');
      done();
    });

    test('[400:20424] 身障類別制度不存在', async (done) => {
      const _data = lodash.cloneDeep(updObj);
      _data.healthFile.disabilityCategoryType = -1;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20424, '身障類別制度不存在');
      done();
    });

    test('[400:20425] 身障類別不存在', async (done) => {
      const _data = lodash.cloneDeep(updObj);
      _data.healthFile.disabilityItem = -1;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20425, '身障類別不存在');
      done();
    });

    test('[400:20135] 點心不存在', async (done) => {
      const _data = lodash.cloneDeep(updObj);
      _data.foodFile.dessert = -1;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20135, '點心不存在');
      done();
    });
  })

  describe('成功', () => {
    test('[200] 更新個案-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, updObj);
      expect(res.status).toBe(200);

      const caseCol = NativeDBClient.getCollection(modelCodes.CASE);
      const caseRes = await caseCol.findOne({ _id: new ObjectId(caseData.data[0]._id) });
      expect(caseRes.dc.caseNumber).toBe(updObj.dc.caseNumber);

      let contactHashName = '';
      for await (const c of updObj.contacts[0].name) {
        contactHashName += await (await customTools.hashedWithSalt(c)).substring(0, 8);
      }
      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      const contactRes = await personCol.findOne({ hashName: contactHashName });
      const casePerson = await personCol.findOne({ _id: new ObjectId(caseData.data[0].personId) });
      expect(contactRes).toBeTruthy();
      expect(contactRes.customer.cusRoles).toHaveLength(1);
      expect(contactRes.customer.cusRoles[0].companyId.toString()).toBe(caseData.data[0].companyId.toString());
      expect(contactRes.customer.cusRoles[0].roles).toMatchObject([customerRoleCodes.family]);
      expect(casePerson.residencePlace.lat).toBe(updObj.residencePlace.lat);
      expect(casePerson.residencePlace.long).toBe(updObj.residencePlace.long);
      done();
    });
  });
})
