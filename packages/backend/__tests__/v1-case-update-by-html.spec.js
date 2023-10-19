/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-case-update-by-html.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-07-11 03:44:55 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 * tag
 */

const request = require('supertest');
const moment = require('moment');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const { DefaultStorageServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const { LunaServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const NativeDBClient = require('./basic/native-db-client');
const modelCodes = require('./enums/model-codes');
const testCorpData = require('./seeder/data/corporation.json').data[0];
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
jest.mock('@erpv3/app-common/shared/connection-clients/default-storage-service-client');
jest.mock('@erpv3/app-common/shared/connection-clients/default-luna-service-client');

describe('Html資料更新個案', () => {
  const METHOD = 'PATCH';
  const _ENDPOINT = '/main/app/api/v1/cases';
  let agent;
  let loginData;
  let headers;
  let caseId;
  let personId;
  let originCarePlanId;

  const obj = {
    tempFile: '',
    planStartDate: '2022/10/10',
    autoJudgeAA11: true,
    basicInfo: {},
    carePlan: {},
  };
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
      .post('/main/app/api/v1/cases/upload').set(headers).field('action', 'create')
      .attach('file', __dirname + '/testFile/carePlan_successful.html');
    const htmlData = res.body.result;
    const _obj = {
      caseService: 'HC',
      tempFile: htmlData.tempFile,
      planStartDate: '2022/06/28',
      autoJudgeAA11: false,
      basicInfo: htmlData.basicInfo,
      carePlan: htmlData.carePlan,
      evaluation: htmlData.evaluation,
    }
    const { LunaServiceClass } = LunaServiceClient;
    DefaultStorageServiceClient.upload.mockResolvedValue({ result: { _id: 'fileId', publicUrl: 'https://test.com/test.html' } });
    LunaServiceClass.normalAPI.mockResolvedValue({
      success: true,
      data: { current: { _id: 'ObjectId', category: ['1', '2'] } }
    });
    const resCreate = await agent.post('/main/app/api/v1/cases/htmlFile').set(headers).send(_obj);
    caseId = resCreate.body.result.caseId;
    personId = resCreate.body.result.personId;
    originCarePlanId = resCreate.body.result.carePlanId;

    const res2 = await agent
      .post('/main/app/api/v1/cases/upload').set(headers).field('action', 'update').field('caseId', caseId)
      .attach('file', __dirname + '/testFile/carePlan_successful_update.html');
    obj.tempFile = res2.body.result.tempFile;
    obj.basicInfo = res2.body.result.basicInfo;
    obj.carePlan = res2.body.result.carePlan;
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    await Base.clearTestFile();
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-storage-service-client');
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-luna-service-client');
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:10301] 暫存檔名空白', async (done) => {
      const _data = lodash.cloneDeep(obj);
      _data.tempFile = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseId}/htmlFile`, headers, _data);
      Base.verifyError(res, 10301, '暫存檔名空白');
      done();
    });

    test('[400:10400] 計畫生效日空白', async (done) => {
      const _data = lodash.cloneDeep(obj);
      _data.planStartDate = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseId}/htmlFile`, headers, _data);
      Base.verifyError(res, 10400, '計畫生效日空白');
      done();
    });

    test('[400:20400] 計劃生效日格式有誤 YYYY/MM/DD', async (done) => {
      const _data = lodash.cloneDeep(obj);
      _data.planStartDate = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseId}/htmlFile`, headers, _data);
      Base.verifyError(res, 20400, '計劃生效日格式有誤');
      done();
    });

    test('[400:20315]自動判定個案身心障礙及失智症格式有誤(boolean)', async (done) => {
      const _data = lodash.cloneDeep(obj);
      _data.autoJudgeAA11 = 'test';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseId}/htmlFile`, headers, _data);
      Base.verifyError(res, 20315, '自動判定個案身心障礙及失智症格式有誤(boolean)');
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:20308] 個案紀錄不存在', async (done) => {
      const _data = lodash.cloneDeep(obj);

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/ooooxxxxooooxxxx/htmlFile`, headers, _data);
      Base.verifyError(res, 20308, '個案紀錄不存在');
      done();
    });
  });

  describe('成功', () => {
    test('[200]Html資料更新個案-成功', async (done) => {
      DefaultStorageServiceClient.upload.mockResolvedValue({ result: { _id: 'fileId2', publicUrl: 'https://test.com/test2.html' } });
      const { LunaServiceClass } = LunaServiceClient;
      LunaServiceClass.normalAPI.mockResolvedValue({
        success: true,
        data: { current: { _id: 'ObjectId', category: ['1', '2'] } }
      });
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseId}/htmlFile`, headers, obj);

      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      const caseCol = NativeDBClient.getCollection(modelCodes.CASE);
      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);

      expect(res.status).toBe(200);
      const { carePlanId } = res.body.result;
      const personRes = await personCol.findOne({ _id: ObjectId(personId) });
      const caseRes = await caseCol.findOne({ _id: ObjectId(caseId) });
      const oldCarePlanRes = await carePlanCol.findOne({ _id: ObjectId(originCarePlanId) });
      const newCarePlanRes = await carePlanCol.findOne({ _id: ObjectId(carePlanId) });
      const agentRes = await personCol.findOne({ _id: personRes.customer.agent.personId });

      expect(await Base.decryptionData(testCorpData.__enc, personRes.name.cipher)).toBe('李恩');
      expect(await Base.decryptionData(testCorpData.__enc, personRes.personalId.cipher)).toBe('A123456789');
      expect(await Base.decryptionData(testCorpData.__enc, personRes.mobile.cipher)).toBe('0935-122250(女)');
      expect(personRes.gender).toBe(0);
      expect(personRes.languages).toEqual([1, 2, 4]);
      expect(personRes.aborigines).toBe(0);
      expect(personRes.aboriginalRace).toBe(null);
      expect(personRes.disability).toBe(2);
      expect(personRes.registerPlace.city).toBe('台中市');
      expect(personRes.registerPlace.region).toBe('大里區');
      expect(personRes.registerPlace.village).toBe('祥興里');
      expect(personRes.registerPlace.neighborhood).toBe('005鄰');
      expect(personRes.registerPlace.road).toBe('中興路二段');
      expect(personRes.registerPlace.others).toBe('７７０號三樓之７');
      expect(personRes.residencePlace.city).toBe('台中市');
      expect(personRes.residencePlace.region).toBe('西屯區');
      expect(personRes.residencePlace.village).toBe('永安里');
      expect(personRes.residencePlace.road).toBe('國安一路');
      expect(personRes.residencePlace.others).toBe('31-1號7樓之5');
      expect(personRes.education).toBe(4);
      expect(personRes.customer.agent.relationship).toBe('女兒');
      expect(personRes.customer.caregivers.primary.age).toBe(25);
      expect(await Base.decryptionData(testCorpData.__enc, agentRes.name.cipher)).toBe('蕭媚心');
      expect(await Base.decryptionData(testCorpData.__enc, agentRes.mobile.cipher)).toBe('0935-122250');
      expect(caseRes.hc.height).toBe(165.0);
      expect(caseRes.hc.weight).toBe(55.0);
      expect(caseRes.hc.livingArrangement).toBe(1);
      expect(caseRes.hc.livingWith).toEqual([3]);
      expect(caseRes.hc.reliefType).toBe(3);
      expect(new Date(newCarePlanRes.planStartDate)).toEqual(new Date(obj.planStartDate));
      expect(newCarePlanRes.version).toBe('2.1');
      expect(newCarePlanRes.disabilityCategoryType).toBe(0);
      expect(newCarePlanRes.isIntellectualDisability).toBe(false);
      expect(newCarePlanRes.reliefType).toBe(3);
      expect(newCarePlanRes.cmsLevel).toBe(3);
      expect(newCarePlanRes.pricingType).toBe(0);
      expect(newCarePlanRes.foreignCareSPAllowance).toBe(false);
      expect(newCarePlanRes.disabilityCertification).toBe(false);
      expect(newCarePlanRes.AA08Declared).toEqual({B: false, C: false });
      expect(newCarePlanRes.AA09Declared).toEqual({B: false, C: false, G: false });
      expect(newCarePlanRes.useBA12).toBe(false);
      expect(new Date(oldCarePlanRes.planEndDate)).toEqual(moment(obj.planStartDate, 'YYYY/MM/DD').subtract(1, 'd').toDate());
      expect(newCarePlanRes.carePlanFile.id).toBe('fileId2');
      expect(newCarePlanRes.carePlanFile.publicUrl).toBe('https://test.com/test2.html');
      done();
    });
  });
});