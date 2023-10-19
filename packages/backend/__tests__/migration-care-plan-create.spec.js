/**
 * FeaturePath: 個案管理-計畫-照顧計畫-新增照顧計畫
 * Accountable: JoyceS Hsu, Wilbert Yang
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: migration-care-plan-create.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-08-03 10:53:12 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const moment = require('moment');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testServiceItemData = require('./seeder/data/serviceItem.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('創建目前照顧計畫 for migration', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/migration/api/carePlans/n';
  let agent;
  let loginData;
  let headers;
  const _id = new ObjectId();
  const updateObj = {
    refCarePlanId: _id.toString(),
    planStartDate: '2021/04/30',
    consultingDate: '2021/04/01',
    acceptConsultingDate: '2021/04/01',
    visitingDate: '2021/04/15',
    firstServiceDate: '2021/05/01',
    cmsLevel: 8,
    reliefType: 1,
    pricingType: 1,
    foreignCareSPAllowance: false,
    bcPayment: {
      quota: 40000,
      excessOwnExpense: 10000,
    },
    gPayment: {
      quota: 20000,
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
        itemId: '',
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
      planStartDate: new Date('2020/04/30'),
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
    await carePlanCol.insertMany([carePlanData1]);

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
    test('[400:10403] 參照的目前照顧計畫Id空白', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.refCarePlanId = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10403, '參照的目前照顧計畫Id空白');
      done();
    });
    test('[400:10400] 計畫生效日空白', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.planStartDate = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10400, '計畫生效日空白');
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:20420] 參照的目前照顧計畫Id不存在', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.refCarePlanId = new ObjectId().toString();

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20420, '參照的目前照顧計畫Id不存在');
      done();
    });
    test('[400:20418] 支援服務項目Id不存在', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.serviceItems[0].itemId = new ObjectId().toString();

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20418, '支援服務項目Id不存在');

      done();
    });
    test('[400:20421] B+C照顧項目: (總金額)超出(給付額度+超額自費)', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.bcPayment = { quota: 100, excessOwnExpense: 0 };

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20421, 'B+C照顧項目: (總金額)超出(給付額度+超額自費)');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 創建目前照顧計畫-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, updateObj);

      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
      const careRes = await carePlanCol.findOne({ _id: new ObjectId(res.body.result.id) });
      const careOldRes = await carePlanCol.findOne({ _id: new ObjectId(_id) });

      expect(res.status).toBe(200);
      expect(careRes.isHtml).toBe(false);
      expect(careRes.cmsLevel).toBe(updateObj.cmsLevel);
      expect(careRes.reliefType).toBe(updateObj.reliefType);
      expect(careRes.pricingType).toBe(updateObj.pricingType);
      expect(careRes.bcPayment.quota).toBe(updateObj.bcPayment.quota);
      expect(careRes.bcPayment.excessOwnExpense).toBe(updateObj.bcPayment.excessOwnExpense);
      expect(careRes.gPayment.quota).toBe(updateObj.gPayment.quota);
      expect(careRes.AA05EntitledDeclared).toEqual(updateObj.AA05EntitledDeclared);
      expect(careRes.AA06EntitledDeclared).toEqual(updateObj.AA06EntitledDeclared);
      expect(careRes.AA07EntitledDeclared).toEqual(updateObj.AA07EntitledDeclared);
      expect(careRes.serviceItems[0].itemId.toString()).toBe(updateObj.serviceItems[0].itemId);
      expect(careRes.serviceItems[0].itemType).toBe('B');
      expect(careRes.serviceItems[0].amount).toBe(updateObj.serviceItems[0].amount);
      expect(careRes.__vn).toBe(0);
      expect(careOldRes.planEndDate).toEqual(moment(updateObj.planStartDate, 'YYYY/MM/DD').subtract(1, 'd').toDate());
      done();
    });
  });
});
 
