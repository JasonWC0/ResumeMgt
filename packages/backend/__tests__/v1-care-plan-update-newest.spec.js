/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-care-plan-update-newest.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-06-09 11:38:49 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testServiceItemData = require('./seeder/data/serviceItem.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('更新目前照顧計畫', () => {
  const METHOD = 'PATCH';
  const _ENDPOINT = '/main/app/api/v1/carePlans/n';
  let agent;
  let loginData;
  let headers;
  const _id = new ObjectId();
  const _id2 = new ObjectId();
  const updateObj = {
    planStartDate: '2021/05/30',
    consultingDate: '2022/04/01',
    acceptConsultingDate: '2022/04/01',
    visitingDate: '2022/04/15',
    firstServiceDate: '2022/05/01',
    cmsLevel: 8,
    reliefType: 1,
    pricingType: 1,
    foreignCareSPAllowance: false,
    bcPayment: {
      quota: 20000,
      excessOwnExpense: 10000,
    },
    gPayment: {
      quota: 20000,
    },
    AA08Declared: {
      B: true,
      C: false,
      G: true,
    },
    AA09Declared: {
      B: true,
      C: true
    },
    useBA12: true,
    serviceItems: [
      {
        itemId: testServiceItemData[0]._id,
        amount: 20,
      },
    ],
    note: 'nononononno',
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
      companyId: testCompanyData[0]._id
    }

    const caseId = new ObjectId();
    const carePlanData1 = {
      _id,
      version: 'v1.0',
      isHtml: true,
      caseId: caseId,
      planType: 0,
      consultingDate: new Date('2022/04/01'),
      acceptConsultingDate: new Date('2022/04/01'),
      visitingDate: new Date('2022/04/15'),
      firstServiceDate: new Date('2022/05/01'),
      reliefType: 1,
      cmsLevel: 3,
      disabilityCategoryType: 1,
      newDisabilityCategories: [1, 2],
      disabilityCategories: [1, 2],
      oldDisabilityCategories: '',
      oldDisabilityCategoriesList: [],
      disabilityCertification: false,
      disability: 0,
      disabilityItem: 0,
      intellectualDisabilities: true,
      isAA11aRemind: true,
      isAA11a: true,
      isAA11b: false,
      pricingType: 0,
      foreignCareSPAllowance: false,
      planStartDate: new Date('2022/04/30'),
      introduction: '簡述',
      subjectChangeSummary: '主旨',
      changeReason: '異動原因',
      declaredServiceCategory: [1, 2],
      serviceCategoryOfACM: [1, 5],
      disease: '疾病',
      hasDiseaseHistory: true,
      diseaseHistoryStr: '疾病1, 疾病2',
      diseaseHistoryList: [1, 2],
      behaviorAndEmotion: '行為與情緒',
      note: '備註',
      bcPayment: {
        quota: 10000,
        subsidy: 6000,
        copayment: 4000,
        excessOwnExpense: 1000,
      },
      gPayment: {
        quota: 10000,
        subsidy: 7000,
        copayment: 3000,
      },
      AA05EntitledDeclared: {
        isWriteOffAfter10712: false,
        isWriteOffBetween10709And10711: false,
      },
      AA06EntitledDeclared: {
        isWriteOffAfter10712: false,
        isWriteOffBetween10709And10711: false,
      },
      AA07EntitledDeclared: {
        isWriteOffAfter10712: false,
        isWriteOffBetween10709And10711: false,
      },
      AA08Declared: {
        B: true,
        C: true,
      },
      AA09Declared: {
        B: true,
        C: false,
        G: true,
      },
      useBA12: true,
      serviceItems: [
        {
          itemId: new ObjectId(testServiceItemData[0]._id),
          itemType: 'RA',
          amount: 15,
        },
        {
          itemId: new ObjectId(testServiceItemData[1]._id),
          itemType: 'RA',
          amount: 10,
        },
      ],
      otherServiceItems: [
        {
          item: '新服務1',
          price: 500,
          amount: 10,
          total: 5000,
        },
        {
          item: '新服務2',
          price: 300,
          amount: 20,
          total: 6000,
        }
      ],
      introductionOfAOrg: 'Ａ單位：計畫目標',
      executionOfAOrg: 'Ａ單位：執行規劃',
      noteOfAOrg: 'Ａ單位：備註',
      serviceItemOfAOrg: [
        {
          item: '跌倒風險-1[協助移位(平行)]',
          careManagerName: '',
          aOrgName: '',
          reason: '主要照顧者要求',
        },
        {
          item: '社會參與需協助-1[陪同外出服務-陪同社交活動]',
          careManagerName: '',
          aOrgName: '',
          reason: '給付額度有限,選擇其他服務'
        }
      ],
      OPTDecisionRefIds: [],
      isOPTDecisionRefCase: false,
      caseManagerInfo: {
        name: '王健康',
        phone: '02-22474899',
        email: 'testmail@org.com',
        org: '健康運動單位',
      },
      signOffSupervisor: [
        {
          name: '督導1',
          status: '審核通過',
          date: new Date('2022/03/01'),
        },
        {
          name: '督導2',
          status: '審核通過',
          date: new Date('2022/03/15'),
        }
      ],
      valid: true,
      __vn: 0,
      __sc: 'test',
    }
    const carePlanData2 = {
      _id: _id2,
      version: 'v1.0',
      isHtml: true,
      caseId: caseId,
      planType: 0,
      consultingDate: new Date('2020/04/01'),
      acceptConsultingDate: new Date('2020/04/01'),
      visitingDate: new Date('2020/04/15'),
      firstServiceDate: new Date('2020/05/01'),
      reliefType: 1,
      cmsLevel: 3,
      disabilityCategoryType: 1,
      newDisabilityCategories: [1, 2],
      disabilityCategories: [1, 2],
      oldDisabilityCategories: '',
      oldDisabilityCategoriesList: [],
      disabilityCertification: false,
      disability: 0,
      disabilityItem: 0,
      intellectualDisabilities: true,
      isAA11aRemind: true,
      isAA11a: true,
      isAA11b: false,
      pricingType: 0,
      foreignCareSPAllowance: false,
      planStartDate: new Date('2020/03/30'),
      planEndDate: new Date('2020/04/29'),
      introduction: '簡述',
      subjectChangeSummary: '主旨',
      changeReason: '異動原因',
      declaredServiceCategory: [1, 2],
      serviceCategoryOfACM: [1, 5],
      disease: '疾病',
      hasDiseaseHistory: true,
      diseaseHistoryStr: '疾病1, 疾病2',
      diseaseHistoryList: [1, 2],
      behaviorAndEmotion: '行為與情緒',
      note: '備註',
      bcPayment: {
        quota: 10000,
        subsidy: 6000,
        copayment: 4000,
        excessOwnExpense: 1000,
      },
      gPayment: {
        quota: 10000,
        subsidy: 7000,
        copayment: 3000,
      },
      AA05EntitledDeclared: {
        isWriteOffAfter10712: false,
        isWriteOffBetween10709And10711: false,
      },
      AA06EntitledDeclared: {
        isWriteOffAfter10712: false,
        isWriteOffBetween10709And10711: false,
      },
      AA07EntitledDeclared: {
        isWriteOffAfter10712: false,
        isWriteOffBetween10709And10711: false,
      },
      AA08Declared: {
        B: true,
        C: true,
      },
      AA09Declared: {
        B: true,
        C: false,
        G: true,
      },
      useBA12: true,
      serviceItems: [
        {
          itemId: new ObjectId(testServiceItemData[0]._id),
          itemType: 'RA',
          amount: 15,
        },
        {
          itemId: new ObjectId(testServiceItemData[1]._id),
          itemType: 'RA',
          amount: 10,
        },
      ],
      introductionOfAOrg: 'Ａ單位：計畫目標',
      executionOfAOrg: 'Ａ單位：執行規劃',
      noteOfAOrg: 'Ａ單位：備註',
      serviceItemOfAOrg: [
        {
          item: '跌倒風險-1[協助移位(平行)]',
          careManagerName: '',
          aOrgName: '',
          reason: '主要照顧者要求',
        },
        {
          item: '社會參與需協助-1[陪同外出服務-陪同社交活動]',
          careManagerName: '',
          aOrgName: '',
          reason: '給付額度有限,選擇其他服務'
        }
      ],
      OPTDecisionRefIds: [],
      isOPTDecisionRefCase: false,
      caseManagerInfo: {
        name: '王健康',
        phone: '02-22474899',
        email: 'testmail@org.com',
        org: '健康運動單位',
      },
      signOffSupervisor: [
        {
          name: '督導1',
          status: '審核通過',
          date: new Date('2020/03/01'),
        },
        {
          name: '督導2',
          status: '審核通過',
          date: new Date('2020/03/15'),
        }
      ],
      valid: true,
      __vn: 0,
      __sc: 'test',
    }

    const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
    await carePlanCol.insertMany([carePlanData1, carePlanData2]);

    const serviceItemCol = NativeDBClient.getCollection(modelCodes.SERVICEITEM);
    const serviceItem = await serviceItemCol.findOne({ _id: ObjectId('5a61951da5a30d265d7377ce') });
    updateObj.serviceItems[0].itemId = serviceItem._id.toString();
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:10400] 計畫生效日空白', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.planStartDate = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 10400, '計畫生效日空白');

      done();
    });
    test('[400:10401] 福利身份別空白', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.reliefType = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 10401, '福利身份別空白');

      done();
    });
    test('[400:20400] 計劃生效日格式有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.planStartDate = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20400, '計劃生效日格式有誤');

      done();
    });
    test('[400:20402] 福利身份別資料有誤, 須1~3', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.reliefType = 9999;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20402, '福利身份別資料有誤');

      done();
    });
    test('[400:20403] 使用BA12格式有誤(boolean)', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.useBA12 = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20403, '使用BA12格式有誤');

      done();
    });
    test('[400:20405] 照會日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.consultingDate = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20405, '照會日期格式有誤');

      done();
    });
    test('[400:20406] 接受照會日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.acceptConsultingDate = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20406, '接受照會日期格式有誤');

      done();
    });
    test('[400:20407] 訪視日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.visitingDate = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20407, '訪視日期格式有誤');

      done();
    });
    test('[400:20408] 初次服務日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.firstServiceDate = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20408, '初次服務日期格式有誤');

      done();
    });
    test('[400:20409] CMS等級資料有誤, 須1~8', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.cmsLevel = 9999;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20409, 'CMS等級資料有誤');

      done();
    });
    test('[400:20410] 計價類別資料有誤, 須0~1', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.pricingType = 9999;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20410, '計價類別資料有誤');

      done();
    });
    test('[400:20404] 請外勞護照或領有特照津貼格式有誤(boolean)', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.foreignCareSPAllowance = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20404, '請外勞護照或領有特照津貼格式有誤');

      done();
    });
    test('[400:20411] 給付額度格式有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.bcPayment.quota = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20411, '給付額度格式有誤');

      done();
    });
    test('[400:20412] 補助金額格式有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.bcPayment.subsidy = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20412, '補助金額格式有誤');

      done();
    });
    test('[400:20413] 民眾部份負擔格式有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.gPayment.copayment = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20413, '民眾部份負擔格式有誤');

      done();
    });
    test('[400:20414] 超額自費格式有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.bcPayment.excessOwnExpense = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20414, '超額自費格式有誤');

      done();
    });
    test('[400:20415] 申報B碼格式有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.AA08Declared.B = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20415, '申報B碼格式有誤');

      done();
    });
    test('[400:20416] 申報C碼格式有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.AA08Declared.C = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20416, '申報C碼格式有誤');

      done();
    });
    test('[400:20417] 申報G碼格式有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.AA09Declared.G = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20417, '申報G碼格式有誤');

      done();
    });
    test('[400:10402] 支援服務項目Id空白', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.serviceItems[0].itemId= '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 10402, '支援服務項目Id空白');

      done();
    });
    test('[400:20419] 支援服務項目數量格式有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.serviceItems[0].amount= 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20419, '支援服務項目數量格式有誤');

      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:20401] 照顧計畫不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/tttttttt`, headers, updateObj);
      Base.verifyError(res, 20401, '照顧計畫不存在');
      done();
    });
    test('[400:20418] 支援服務項目Id不存在', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.serviceItems[0].itemId = new ObjectId().toString();

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20418, '支援服務項目Id不存在');

      done();
    });
    test('[400:20422] 生效日不得早於(等於)上一份照顧計畫生效日或晚於(等於)該份計畫結束日', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.planStartDate ='2020/01/01';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, _data);
      Base.verifyError(res, 20422, '生效日不得早於(等於)上一份照顧計畫生效日或晚於(等於)該份計畫結束日');
      done();
    });
    test('[400:20423] 此照顧計畫並非最新', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id2}`, headers, updateObj);
      Base.verifyError(res, 20423, '此照顧計畫並非最新');
      done();
    });
    test('[400:90010] 資料版號有誤(低於現有版本)', async (done) => {
      const _headers = lodash.cloneDeep(headers);
      _headers.vn = -1;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, _headers, updateObj);
      Base.verifyError(res, 90010, 'Data vn fail');

      done();
    });
  });

  describe('成功', () => {
    test('[200] 更新目前照顧計畫-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${_id}`, headers, updateObj);

      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
      const careRes = await carePlanCol.findOne({ _id: new ObjectId(_id) });

      expect(res.status).toBe(200);
      expect(careRes.isHtml).toBe(false);
      expect(careRes.cmsLevel).toBe(updateObj.cmsLevel);
      expect(careRes.reliefType).toBe(updateObj.reliefType);
      expect(careRes.pricingType).toBe(updateObj.pricingType);
      expect(careRes.bcPayment.quota).toBe(updateObj.bcPayment.quota);
      expect(careRes.bcPayment.excessOwnExpense).toBe(updateObj.bcPayment.excessOwnExpense);
      expect(careRes.gPayment.quota).toBe(updateObj.gPayment.quota);
      expect(careRes.serviceItems[0].itemId.toString()).toBe(updateObj.serviceItems[0].itemId);
      expect(careRes.serviceItems[0].itemType).toBe('B');
      expect(careRes.serviceItems[0].amount).toBe(updateObj.serviceItems[0].amount);
      expect(careRes.__vn).toBe(1);
      done();
    });
  });
});
