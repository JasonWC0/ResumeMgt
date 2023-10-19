/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-case-upload-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-07-06 04:32:15 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { DefaultStorageServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const { LunaServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
jest.mock('@erpv3/app-common/shared/connection-clients/default-storage-service-client');
jest.mock('@erpv3/app-common/shared/connection-clients/default-luna-service-client');

describe('上傳照顧計畫Html(匯入更新)', () => {
  const _ENDPOINT = '/main/app/api/v1/cases/upload';
  let agent;
  let loginData;
  let headers;
  let caseId;

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

    const res = await agent
      .post('/main/app/api/v1/cases/upload')
      .set(headers)
      .field('action', 'create')
      .attach('file', __dirname + '/testFile/carePlan_successful.html');
    const htmlData = res.body.result;
    const obj = {
      caseService: 'HC',
      tempFile: htmlData.tempFile,
      planStartDate: '2022/06/28',
      autoJudgeAA11: false,
      basicInfo: htmlData.basicInfo,
      carePlan: htmlData.carePlan,
      evaluation: htmlData.evaluation,
    };
    const { LunaServiceClass } = LunaServiceClient;
    DefaultStorageServiceClient.upload.mockResolvedValue({ result: { _id: 'fileId', publicUrl: 'https://test.com/test.html' } });
    LunaServiceClass.normalAPI.mockResolvedValue({
      success: true,
      data: { current: { _id: 'ObjectId', category: ['1', '2'] } }
    });
    const resCreate = await Base.callAPI(agent, 'POST', '/main/app/api/v1/cases/htmlFile', headers, obj);
    caseId = resCreate.body.result.caseId;
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-storage-service-client');
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-luna-service-client');
    done();
  });

  describe('成功', () => {
    test('[200]上傳照顧計畫Html(匯入更新)-成功', async (done) => {
      const { LunaServiceClass } = LunaServiceClient;
      LunaServiceClass.normalAPI.mockResolvedValue({
        success: true,
        data: []
      });
      const res = await agent
        .post(_ENDPOINT)
        .set(headers)
        .field('action', 'update')
        .field('caseId', caseId)
        .attach('file', __dirname + '/testFile/carePlan_successful_update.html');

      expect(res.status).toBe(200);
      expect(res.body.result.basicInfo.name).toBe('李恩');
      expect(res.body.result.basicInfo.gender).toBe(0);
      expect(res.body.result.basicInfo.personalId).toBe('A123456789');
      expect(res.body.result.basicInfo.birthDate).toBe('1965/01/23');
      expect(res.body.result.basicInfo.mobile).toBe('0935-122250(女)');
      expect(res.body.result.basicInfo.height).toBe(165.0);
      expect(res.body.result.basicInfo.weight).toBe(55.0);
      expect(res.body.result.basicInfo.languages).toEqual([1, 2, 4]);
      expect(res.body.result.basicInfo.aborigines).toBe(0);
      expect(res.body.result.basicInfo.aboriginalRace).toEqual(null);
      expect(res.body.result.basicInfo.registerPlace.city).toBe('台中市');
      expect(res.body.result.basicInfo.registerPlace.region).toBe('大里區');
      expect(res.body.result.basicInfo.registerPlace.village).toBe('祥興里');
      expect(res.body.result.basicInfo.registerPlace.neighborhood).toBe('005鄰');
      expect(res.body.result.basicInfo.registerPlace.road).toBe('中興路二段');
      expect(res.body.result.basicInfo.registerPlace.others).toBe('７７０號三樓之７');
      expect(res.body.result.basicInfo.residencePlace.city).toBe('台中市');
      expect(res.body.result.basicInfo.residencePlace.region).toBe('西屯區');
      expect(res.body.result.basicInfo.residencePlace.village).toBe('永安里');
      expect(res.body.result.basicInfo.residencePlace.road).toBe('國安一路');
      expect(res.body.result.basicInfo.residencePlace.others).toBe('31-1號7樓之5');
      expect(res.body.result.basicInfo.education).toBe(4);
      expect(res.body.result.basicInfo.livingArrangement).toBe(1);
      expect(res.body.result.basicInfo.livingWith).toEqual([3]);
      expect(res.body.result.basicInfo.agent.name).toBe('蕭媚心');
      expect(res.body.result.basicInfo.agent.phoneH).toBe('');
      expect(res.body.result.basicInfo.agent.mobile).toBe('0935-122250');
      expect(res.body.result.basicInfo.agent.relationship).toBe('女兒');
      expect(res.body.result.basicInfo.agent.note).toBe('');
      expect(res.body.result.basicInfo.agent.residencePlace.city).toBe('台中市');
      expect(res.body.result.basicInfo.agent.residencePlace.region).toBe('西屯區');
      expect(res.body.result.basicInfo.agent.residencePlace.village).toBe('永安里');
      expect(res.body.result.basicInfo.agent.residencePlace.road).toBe('國安一路');
      expect(res.body.result.basicInfo.agent.residencePlace.others).toBe('31-1號7樓之5');
      expect(res.body.result.basicInfo.contacts[0].name).toBe('蕭媚心');
      expect(res.body.result.basicInfo.contacts[0].phoneH).toBe('');
      expect(res.body.result.basicInfo.contacts[0].mobile).toBe('0935-122250');
      expect(res.body.result.basicInfo.contacts[0].relationship).toBe('女兒');
      expect(res.body.result.basicInfo.contacts[0].note).toBe('');
      expect(res.body.result.basicInfo.contacts[0].residencePlace.city).toBe('台中市');
      expect(res.body.result.basicInfo.contacts[0].residencePlace.region).toBe('西屯區');
      expect(res.body.result.basicInfo.contacts[0].residencePlace.village).toBe('永安里');
      expect(res.body.result.basicInfo.contacts[0].residencePlace.road).toBe('國安一路');
      expect(res.body.result.basicInfo.contacts[0].residencePlace.others).toBe('31-1號7樓之5');
      expect(res.body.result.basicInfo.caregivers.primary.name).toBe('蕭媚心(87年次)');
      expect(res.body.result.basicInfo.caregivers.primary.gender).toBe(1);
      expect(res.body.result.basicInfo.caregivers.primary.relationship).toBe('女兒');
      expect(res.body.result.basicInfo.caregivers.primary.age).toBe(25);
      expect(res.body.result.basicInfo.caregivers.secondary.name).toBe('');
      expect(res.body.result.basicInfo.caregivers.secondary.relationship).toBe('');

      expect(res.body.result.carePlan.version).toBe('2.1');
      expect(res.body.result.carePlan.disabilityCategoryType).toBe(0);
      expect(res.body.result.carePlan.newDisabilityCategories).toEqual([7]);
      expect(res.body.result.carePlan.icd).toEqual([3]);
      expect(res.body.result.carePlan.icdOthers).toBe('I62.9');
      expect(res.body.result.carePlan.disability).toBe(2);
      expect(res.body.result.carePlan.isIntellectualDisability).toEqual(false);
      expect(res.body.result.carePlan.reliefType).toBe(3);
      expect(res.body.result.carePlan.cmsLevel).toBe(3);
      expect(res.body.result.carePlan.bcPayment.quota).toBe(15460);
      expect(res.body.result.carePlan.bcPayment.subsidy).toBe(12987);
      expect(res.body.result.carePlan.bcPayment.copayment).toBe(2473);
      expect(res.body.result.carePlan.gPayment.quota).toBe(32340);
      expect(res.body.result.carePlan.gPayment.subsidy).toBe(27166);
      expect(res.body.result.carePlan.gPayment.copayment).toBe(5174);
      expect(res.body.result.carePlan.pricingType).toBe(0);
      expect(res.body.result.carePlan.foreignCareSPAllowance).toEqual({foreignCare: false, specialAllowance: false});
      expect(res.body.result.carePlan.disabilityCertification).toEqual(false);
      expect(res.body.result.carePlan.AA08Declared).toEqual({B: false, C: false });
      expect(res.body.result.carePlan.AA09Declared).toEqual({B: false, C: false, G: false });
      expect(res.body.result.carePlan.useBA12).toEqual(false);
      expect(res.body.result.carePlan.serviceItems[3]).toEqual({ item: 'BA11[肢體關節活動]', cost: 195.0, amount: 20, total: 2730.0, itemType: 'B', newItem: false });
      expect(res.body.result.carePlan.serviceItems[4]).toEqual({ item: 'BA13[陪同外出]', cost: 195.0, amount: 28, total: 5460.0, itemType: 'B', newItem: false });
      expect(res.body.result.carePlan.signOffSupervisor[0]).toEqual({ name: '陳怡儒', status: '審核通過', date: '2021/02/01' });
      expect(res.body.result.carePlan.subjectChangeSummary).toBe('*110/02/17接獲案女通知因疫情不穩，調整服務計畫。(個管:謝菁尹)');
      expect(res.body.result.carePlan.declaredServiceCategory).toEqual([1, 6, 8]);
      expect(res.body.result.carePlan.AA05EntitledDeclared).toEqual({ isWriteOffAfter10712: false, isWriteOffBetween10709And10711: false});
      expect(res.body.result.carePlan.AA06EntitledDeclared).toEqual({ isWriteOffAfter10712: false, isWriteOffBetween10709And10711: false});
      expect(res.body.result.carePlan.AA07EntitledDeclared).toEqual({ isWriteOffAfter10712: false, isWriteOffBetween10709And10711: false});
      expect(res.body.result.carePlan.disease).toBe('');
      expect(res.body.result.carePlan.hasDiseaseHistory).toEqual(true);
      expect(res.body.result.carePlan.diseaseHistoryList).toEqual([1,5]);
      expect(res.body.result.carePlan.behaviorAndEmotion).toBe('');

      expect(res.body.result.compare.basicInfo.languages).toBe(true);
      expect(res.body.result.compare.basicInfo.caregivers.primary.age).toBe(true);
      expect(res.body.result.compare.carePlan.serviceItems).toBe(true);
      done();
    });
  });
});