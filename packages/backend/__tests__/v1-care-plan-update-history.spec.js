/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-care-plan-update-history.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-06-07 03:44:02 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const moment = require('moment');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testServiceItemData = require('./seeder/data/serviceItem.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('更新歷史照顧計畫', () => {
  const METHOD = 'PATCH';
  const _ENDPOINT = '/main/app/api/v1/carePlans/h';
  let agent;
  let headers;
  let carePlanData2;
  let carePlanData1;

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
    };

    const caseId = new ObjectId();
    carePlanData1 = {
      _id: new ObjectId(),
      version: 'v1.0',
      isHtml: true,
      caseId: caseId,
      planType: 0,
      consultingDate: new Date('2020/02/01'),
      acceptConsultingDate: new Date('2020/02/01'),
      visitingDate: new Date('2020/02/15'),
      firstServiceDate: new Date('2020/02/01'),
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
      planStartDate: new Date('2020/02/01'),
      planEndDate: new Date('2020/03/31'),
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
          amount: 40,
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
    await carePlanCol.insertMany([carePlanData1, carePlanData2]);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:10400] 計畫生效日空白', async (done) => {
      const obj = {
        note: 'hahahahaha',
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${carePlanData2._id.toString()}`, headers, obj);
      Base.verifyError(res, 10400, '計畫生效日空白');
      done();
    });
    test('[400:20400] 計劃生效日格式有誤', async (done) => {
      const obj = {
        planStartDate: 'test',
        note: 'hahahahaha',
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${carePlanData2._id.toString()}`, headers, obj);
      Base.verifyError(res, 20400, '計劃生效日格式有誤');
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:20401] 照顧計畫不存在', async (done) => {
      const obj = {
        planStartDate: '2020/03/01',
        note: 'hahahahaha',
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/tttttttt`, headers, obj);
      Base.verifyError(res, 20401, '照顧計畫不存在');
      done();
    });
    test('[400:90010] 資料版號有誤(低於現有版本)', async (done) => {
      const obj = {
        planStartDate: '2020/04/30',
        note: 'hahahahaha',
      }
      const _headers = { ...headers, vn: -1}
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${carePlanData2._id.toString()}`, _headers, obj)

      Base.verifyError(res, 90010, 'Data vn fail');
      done();
    });
    test('[400:20422] 生效日不得早於(等於)上一份照顧計畫生效日', async (done) => {
      const obj = {
        planStartDate: '2020/01/01',
        note: 'hahahahaha',
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${carePlanData2._id.toString()}`, headers, obj);

      Base.verifyError(res, 20422, '生效日不得早於(等於)上一份照顧計畫生效日或晚於(等於)該份計畫結束日');
      done();
    });
    test('[400:20422] 生效日不得晚於(等於)該份計畫結束日', async (done) => {
      const obj = {
        planStartDate: '2020/07/01',
        note: 'hahahahaha',
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${carePlanData2._id.toString()}`, headers, obj);

      Base.verifyError(res, 20422, '生效日不得早於(等於)上一份照顧計畫生效日或晚於(等於)該份計畫結束日');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 更新歷史照顧計畫-成功', async (done) => {
      const obj = {
        planStartDate: '2020/03/02',
        note: 'hahahahaha',
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${carePlanData2._id.toString()}`, headers, obj);

      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
      const careRes = await carePlanCol.findOne({ _id: new ObjectId(carePlanData2._id) });
      const careRes2 = await carePlanCol.findOne({ _id: new ObjectId(carePlanData1._id) });
      const optCareRes = await carePlanCol.find({ planType: 1, valid: true }).toArray();
      const newOptCareRes = await carePlanCol.findOne({ planType: 1, planStartDate: new Date('2020/03/01'), valid: true });

      expect(res.status).toBe(200);
      expect(careRes.planStartDate).toEqual(new Date(obj.planStartDate));
      expect(careRes.note).toBe(obj.note);
      expect(careRes.__vn).toBe(1);
      expect(careRes.__sc).toBe('Erpv3');
      expect(careRes.__cc).toBe(res.body.traceId);
      expect(careRes2.planEndDate).toEqual(moment(obj.planStartDate, 'YYYY/MM/DD').subtract(1, 'day').toDate());
      expect(optCareRes.length).toBe(2);
      expect(newOptCareRes.OPTDecisionRefIds.length).toEqual(2);
      expect(newOptCareRes.AA09Declared).toEqual(carePlanData2.AA09Declared);
      for (const item of newOptCareRes.serviceItems) {
        if (item.itemId === carePlanData2.serviceItems[0].itemId) {
          expect(item.amount).toBe(carePlanData2.serviceItems[0].amount);
        }
      }
      done();
    });
  });
});
