const request = require('supertest');
const lodash = require('lodash');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const testCompanyData = require('./seeder/data/company.json').data;
const modelCodes = require('./enums/model-codes');
const { ObjectId } = require('mongodb');
const { customerRoleCodes } = require('../../app-core/domain');

describe('新建個案', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/cases';
  let agent;
  let loginData;
  let headers;
  let query;
  const createObj = {
    personId: '6297366faedc5661c471b1cf',
    corpId: '6209f71974ac715080d36309',
    name: '普羅王',
    healthFile: {
      cmsLevel: 1,
      disabilityCategoryType: 1,
      disabilityItem: 1,
      isAA11a: true,
    },
    foodFile: {
      meal: 1,
      processMethod: '細碎',
      mealSize: '一半',
      dessert: 1,
    },
    caseNumber: 'AA5AA',
    source: 1,
    reliefType: 1,
    livingArrangement: 3,
    billPlaceType: 0,
    billPlace: {
      postalCode: '114',
      city: '台北市',
      region: '內湖區',
      village: '西湖里',
      neighborhood: 1,
      road: '瑞光路',
      others: '585號',
    },
    pipelineService: [1],
    rcServiceItem: 1,
    status: 1,
    scheduledStartDate: '2022/06/22',
    scheduledEndDate: '2022/06/23',
    importDate: '2022/06/20',
    startDate: '2022/06/22',
    endDate: '2022/06/23',
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
      companyId: testCompanyData[1]._id
    }
    query = {
      caseService: "HC"
    }
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位檢查', () => {
    test('[400:10100] 姓名空白', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.personId = '';
      _data.name = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 10100, '姓名空白');
      done();
    });
  })

  describe('資料規則驗證', () => {
    test('[400:20134] 膳食不存在', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.foodFile.meal = -1;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20134, '膳食不存在');
      done();
    });

    test('[400:20106] 人員不存在', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      const fakePersonId = 'fakePersonId';
      _data.personId = fakePersonId;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20106, '人員不存在');
      done();
    });

    test('[400:20409] CMS等級資料有誤', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.healthFile.cmsLevel = -1;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20409, 'CMS等級資料有誤');
      done();
    });

    test('[400:20424] 身障類別制度不存在', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.healthFile.disabilityCategoryType = -1;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20424, '身障類別制度不存在');
      done();
    });

    test('[400:20425] 身障類別不存在', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.healthFile.disabilityItem = -1;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20425, '身障類別不存在');
      done();
    });

    test('[400:20135] 點心不存在', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.foodFile.dessert = -1;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20135, '點心不存在');
      done();
    });

    test('[400:21121] 公司不存在', async (done) => {
      const _headers = lodash.cloneDeep(headers);
      const _data = lodash.cloneDeep(createObj);
      const companyId = '62844e7dddc6c938f0fd417b';
      _headers.companyId = companyId;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, _headers, _data, query);
      Base.verifyError(res, 21121, '公司不存在');
      done();
    });

    test('[400:20302] 個案來源不存在', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.source = -1;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20302, '個案來源不存在');
      done();
    });

    test('[400:20402] 福利身份別資料有誤', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.reliefType = -1;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20402, '福利身份別資料有誤');
      done();
    });

    test('[400:20304] 管路服務項目不存在', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.pipelineService = [-1];

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20304, '管路服務項目不存在');
      done();
    });

    test('[400:20303] 住宿型服務項目不存在', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.rcServiceItem = -1;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20303, '住宿型服務項目不存在');
      done();
    });

    test('[400:20305] 個案服務狀態不存在', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.status = -1;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20305, '個案服務狀態不存在');
      done();
    });

    test('[400:20309] 個案預計開始日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.scheduledStartDate = '101年5月1號';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20309, '個案預計開始日期格式有誤');
      done();
    });

    test('[400:20310] 個案預計結束日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.scheduledEndDate = '101年5月1號';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20310, '個案預計結束日期格式有誤');
      done();
    });

    test('[400:20311] 個案匯入日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.importDate = '101年5月1號';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20311, '個案匯入日期格式有誤');
      done();
    });
    
    test('[400:20009] 開始日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.startDate = '101年5月1號';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20009, '開始日期格式有誤');
      done();
    });

    test('[400:20010] 結束日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      _data.endDate = '101年5月1號';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      Base.verifyError(res, 20010, '結束日期格式有誤');
      done();
    });
  })

  describe('成功', () => {
    test('[200] 創建個案-成功', async (done) => {
      const _data = lodash.cloneDeep(createObj);
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data, query);
      const { caseId } = res.body.result;

      const caseCol = NativeDBClient.getCollection(modelCodes.CASE);
      const caseRes = await caseCol.findOne({ _id: new ObjectId(caseId) });
      expect(res.status).toBe(200);
      expect(caseId).toBe(caseRes._id.toString());
      expect(caseRes.personId.toString()).toBe(createObj.personId);
      const service = caseRes[query.caseService.toLowerCase()];
      expect(service).toBeTruthy();

      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      const cPerson = await personCol.findOne({ _id: new ObjectId(createObj.personId) })
      expect(cPerson).toBeTruthy();
      expect(cPerson.customer.cusRoles).toHaveLength(1);
      expect(cPerson.customer.cusRoles[0].companyId.toString()).toBe(testCompanyData[1]._id.toString());
      expect(cPerson.customer.cusRoles[0].roles).toMatchObject([customerRoleCodes.case]);
      expect(cPerson.residencePlace.lat).toBeTruthy();
      expect(cPerson.residencePlace.long).toBeTruthy();

      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
      const carePlanRes = await carePlanCol.findOne({ caseId: new ObjectId(caseId), $or: [{ planEndDate: { $exists: false } }, { planEndDate: { $in: [null, ''] } }]});
      expect(carePlanRes.cmsLevel).toBe(_data.healthFile.cmsLevel);
      expect(carePlanRes.disabilityCategoryType).toBe(_data.healthFile.disabilityCategoryType);
      expect(carePlanRes.disabilityItem).toBe(_data.healthFile.disabilityItem);
      expect(carePlanRes.isAA11a).toBe(_data.healthFile.isAA11a);
      done();
    });
  });
})
