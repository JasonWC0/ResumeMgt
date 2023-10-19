/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-care-plan-read-newest.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-06-07 10:26:46 am
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

describe('取得最新照顧計畫', () => {
  const _ENDPOINT = '/main/app/api/v1/carePlans/n';
  let agent;
  let loginData;
  let carePlanData1

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    loginData = await Base.login(agent);

    const caseId = new ObjectId();
    carePlanData1 = {
      _id: new ObjectId(),
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
      planStartDate: new Date('2020/04/30'),
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

    const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
    carePlanCol.insertMany([carePlanData1, carePlanData2]);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:10010] 個案Id空白', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: testCompanyData[0]._id
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10010,
        message: '個案Id空白',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[200] 取得最新照顧計畫-成功', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({ caseId: carePlanData1.caseId.toString()})
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: testCompanyData[0]._id
        });

      expect(res.status).toBe(200);
      expect(res.body.result.id).toBe(carePlanData1._id.toString());
      expect(res.body.result.isHtml).toBe(carePlanData1.isHtml);
      expect(new Date(res.body.result.planStartDate)).toEqual(carePlanData1.planStartDate);
      expect(new Date(res.body.result.consultingDate)).toEqual(carePlanData1.consultingDate);
      expect(new Date(res.body.result.acceptConsultingDate)).toEqual(carePlanData1.acceptConsultingDate);
      expect(new Date(res.body.result.visitingDate)).toEqual(carePlanData1.visitingDate);
      expect(res.body.result.cmsLevel).toBe(carePlanData1.cmsLevel);
      expect(res.body.result.reliefType).toBe(carePlanData1.reliefType);
      expect(res.body.result.pricingType).toBe(carePlanData1.pricingType);
      expect(res.body.result.foreignCareSPAllowance).toBe(carePlanData1.foreignCareSPAllowance);
      expect(res.body.result.bcPayment.quota).toBe(carePlanData1.bcPayment.quota);
      expect(res.body.result.bcPayment.excessOwnExpense).toBe(carePlanData1.bcPayment.excessOwnExpense);
      expect(res.body.result.gPayment.quota).toBe(carePlanData1.gPayment.quota);
      expect(res.body.result.AA05EntitledDeclared).toEqual(carePlanData1.AA05EntitledDeclared);
      expect(res.body.result.AA06EntitledDeclared).toEqual(carePlanData1.AA06EntitledDeclared);
      expect(res.body.result.AA07EntitledDeclared).toEqual(carePlanData1.AA07EntitledDeclared);
      expect(res.body.result.AA08Declared).toEqual(carePlanData1.AA08Declared);
      expect(res.body.result.AA09Declared).toEqual(carePlanData1.AA09Declared);
      expect(res.body.result.useBA12).toBe(carePlanData1.useBA12);
      expect(res.body.result.signOffSupervisor.name).toBe(carePlanData1.signOffSupervisor.name);
      expect(res.body.result.signOffSupervisor.status).toBe(carePlanData1.signOffSupervisor.status);
      expect(res.body.result.signOffSupervisor.date).toBe(carePlanData1.signOffSupervisor.date);
      expect(res.body.result.serviceItems[0].itemId).toBe(carePlanData1.serviceItems[0].itemId.toString());
      expect(res.body.result.serviceItems[0].serviceCode).toBe(testServiceItemData[0].serviceCode);
      expect(res.body.result.serviceItems[0].serviceName).toBe(testServiceItemData[0].serviceName);
      expect(res.body.result.serviceItems[0].itemType).toBe(carePlanData1.serviceItems[0].itemType);
      expect(res.body.result.serviceItems[0].amount).toBe(carePlanData1.serviceItems[0].amount);
      expect(res.body.result.otherServiceItems.item).toBe(carePlanData1.otherServiceItems.item);
      expect(res.body.result.otherServiceItems.amount).toBe(carePlanData1.otherServiceItems.amount);
      expect(res.body.result.note).toBe(carePlanData1.note);
      expect(res.body.result.vn).toBe(carePlanData1.__vn);
      done();
    });
  });
});