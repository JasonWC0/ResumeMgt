/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-care-plan-delete-history.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-06-07 03:32:34 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testServiceItemData = require('./seeder/data/serviceItem.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('刪除歷史照顧計畫', () => {
  const METHOD = 'DELETE';
  const _ENDPOINT = '/main/app/api/v1/carePlans/h';
  let agent;
  let headers;
  let carePlanData1;
  let carePlanData2;

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

    const caseId = new ObjectId();
    carePlanData1 = {
      _id: new ObjectId(),
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
      planStartDate: new Date('2020/04/01'),
      planEndDate: new Date('2020/06/01'),
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
    carePlanData2 = {
      _id: new ObjectId(),
      version: 'v1.0',
      isHtml: true,
      caseId: caseId,
      planType: 0,
      consultingDate: new Date('2020/06/02'),
      acceptConsultingDate: new Date('2020/06/02'),
      visitingDate: new Date('2020/06/15'),
      firstServiceDate: new Date('2020/06/02'),
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
      planStartDate: new Date('2020/06/02'),
      planEndDate: new Date('2020/07/15'),
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
    carePlanCol.insertMany([carePlanData1, carePlanData2]);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('資料規則驗證', () => {
    test('[400:20401] 照顧計畫不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/tttttttt`, headers);
      Base.verifyError(res, 20401, '照顧計畫不存在');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 刪除歷史照顧計畫-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${carePlanData1._id.toString()}`, headers);

      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
      const careRes1 = await carePlanCol.findOne({ _id: new ObjectId(carePlanData1._id) });
      const careRes2 = await carePlanCol.findOne({ _id: new ObjectId(carePlanData2._id) });
      const optCareRes = await carePlanCol.find({ planType: 1, valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(careRes1.valid).toBe(false);
      expect(careRes1.__vn).toBe(1);
      expect(careRes1.__sc).toBe('Erpv3');
      expect(careRes1.__cc).toBe(res.body.traceId);
      expect(careRes2.planStartDate).toEqual(carePlanData1.planStartDate);
      expect(optCareRes.length).toBe(3);
      done();
    });
  });
});
