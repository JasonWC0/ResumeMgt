/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-case-auto-judge-aa11.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-07-13 09:27:20 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 * tag
 */

const request = require('supertest');
const moment = require('moment');
const { ObjectId } = require('mongodb');
const { DefaultStorageServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const { LunaServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const NativeDBClient = require('./basic/native-db-client');
const modelCodes = require('./enums/model-codes');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
jest.mock('@erpv3/app-common/shared/connection-clients/default-storage-service-client');
jest.mock('@erpv3/app-common/shared/connection-clients/default-luna-service-client');

describe('判斷個案身心障礙/失智症', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/cases';
  let agent;
  let loginData;
  let headers;
  let caseId;
  let personId;
  let carePlanId;
  let htmlData;

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
    htmlData = res.body.result;
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
    carePlanId = resCreate.body.result.carePlanId;
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

  describe('成功', () => {
    test('[200]判斷個案身心障礙/失智症(isAA11a判斷 條件一: 新身障[1.第一類] + 疾病史[13.精神疾病, 14.自閉症, 15.智能不足] + 小於45歲)-成功', async (done) => {
      const _newDisability = [1, 5];
      const _diseaseHistory = [2, 13, 19];
      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      await carePlanCol.updateOne({ _id: ObjectId(carePlanId) }, { $set: { newDisabilityCategories: _newDisability, diseaseHistoryList: _diseaseHistory } });
      await personCol.updateOne({ _id: ObjectId(personId) }, { $set: { birthDate: moment().subtract(20, 'y').toDate() } });

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseId}/autoJudgeAA11`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result.isAA11a).toBe(true);
      expect(res.body.result.isAA11b).toBe(false);
      expect(res.body.result.isAA11aRemind).toBe(true);
      done();
    });
    test('[200]判斷個案身心障礙/失智症(isAA11a判斷 條件二: 新身障[!normal]] + 疾病史[22.罕見疾病, 23.頑性(難治型)癲癇症] + 小於45歲)-成功', async (done) => {
      const _newDisability = [2, 5];
      const _diseaseHistory = [2, 22];
      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      await carePlanCol.updateOne({ _id: ObjectId(carePlanId) }, { $set: { newDisabilityCategories: _newDisability, diseaseHistoryList: _diseaseHistory } });
      await personCol.updateOne({ _id: ObjectId(personId) }, { $set: { birthDate: moment().subtract(20, 'y').toDate() } });

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseId}/autoJudgeAA11`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result.isAA11a).toBe(true);
      expect(res.body.result.isAA11b).toBe(false);
      expect(res.body.result.isAA11aRemind).toBe(true);
      done();
    });
    test('[200]判斷個案身心障礙/失智症(isAA11a判斷 條件二: icd[3.其他] + icd其他有R40.2|R40.3 + 小於45歲)-成功', async (done) => {
      const _newDisability = [];
      const _diseaseHistory = [];
      const icd = [3];
      const icdOthers = 'ICD:R40.2、R40.3';
      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      await carePlanCol.updateOne({ _id: ObjectId(carePlanId) }, { $set: { newDisabilityCategories: _newDisability, diseaseHistoryList: _diseaseHistory, icd, icdOthers } });
      await personCol.updateOne({ _id: ObjectId(personId) }, { $set: { birthDate: moment().subtract(20, 'y').toDate() } });

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseId}/autoJudgeAA11`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result.isAA11a).toBe(true);
      expect(res.body.result.isAA11b).toBe(false);
      expect(res.body.result.isAA11aRemind).toBe(true);
      done();
    });
    test('[200]判斷個案身心障礙/失智症(isAA11b判斷 條件三: 疾病史[12.失智症])-成功', async (done) => {
      const _newDisability = [];
      const _diseaseHistory = [12];
      const icd = [];
      const icdOthers = '';
      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      await carePlanCol.updateOne({ _id: ObjectId(carePlanId) }, { $set: { newDisabilityCategories: _newDisability, diseaseHistoryList: _diseaseHistory, icd, icdOthers } });
      await personCol.updateOne({ _id: ObjectId(personId) }, { $set: { birthDate: moment().subtract(20, 'y').toDate() } });

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseId}/autoJudgeAA11`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result.isAA11a).toBe(false);
      expect(res.body.result.isAA11b).toBe(true);
      expect(res.body.result.isAA11aRemind).toBe(true);
      done();
    });
    test('[200]判斷個案身心障礙/失智症(isAA11a判斷 條件四: 舊身障[12., 11., 6., 10.,14., 9., 15] + 小於45歲)-成功', async (done) => {
      const _oldDisabilityList = [2, 6];
      const _diseaseHistory = [];
      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      await carePlanCol.updateOne({ _id: ObjectId(carePlanId) }, { $set: { oldDisabilityCategoriesList: _oldDisabilityList, diseaseHistoryList: _diseaseHistory } });
      await personCol.updateOne({ _id: ObjectId(personId) }, { $set: { birthDate: moment().subtract(20, 'y').toDate() } });

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseId}/autoJudgeAA11`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result.isAA11a).toBe(true);
      expect(res.body.result.isAA11b).toBe(false);
      expect(res.body.result.isAA11aRemind).toBe(true);
      done();
    });
    test('[200]判斷個案身心障礙/失智症(isAA11a判斷 條件五: 新身障[1.第一類] + icd[1.G80] + 小於45歲)-成功', async (done) => {
      const _newDisability = [1, 2, 5];
      const _diseaseHistory = [];
      const icd = [1];
      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      await carePlanCol.updateOne({ _id: ObjectId(carePlanId) }, { $set: { newDisabilityCategories: _newDisability, diseaseHistoryList: _diseaseHistory, icd } });
      await personCol.updateOne({ _id: ObjectId(personId) }, { $set: { birthDate: moment().subtract(20, 'y').toDate() } });

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseId}/autoJudgeAA11`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result.isAA11a).toBe(true);
      expect(res.body.result.isAA11b).toBe(false);
      expect(res.body.result.isAA11aRemind).toBe(true);
      done();
    });
    test('[200]判斷個案身心障礙/失智症(isAA11a判斷 條件五: 新身障[2.第二類] + icd[2.S14、S24、S34] + 小於45歲)-成功', async (done) => {
      const _newDisability = [1, 2, 5];
      const _diseaseHistory = [];
      const icd = [2];
      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      await carePlanCol.updateOne({ _id: ObjectId(carePlanId) }, { $set: { newDisabilityCategories: _newDisability, diseaseHistoryList: _diseaseHistory, icd } });
      await personCol.updateOne({ _id: ObjectId(personId) }, { $set: { birthDate: moment().subtract(20, 'y').toDate() } });

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseId}/autoJudgeAA11`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result.isAA11a).toBe(true);
      expect(res.body.result.isAA11b).toBe(false);
      expect(res.body.result.isAA11aRemind).toBe(true);
      done();
    });
    test('[200]判斷個案身心障礙/失智症(isAA11aRemind判斷: 「身障類別」勾選"無"以外的項目 + 小於45歲)-成功', async (done) => {
      const _newDisability = [];
      const _oldDisabilityList = [];
      const _disabilityCategory = [1, 2, 5];
      const icd = [];
      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      await carePlanCol.updateOne({ _id: ObjectId(carePlanId) }, { $set: { newDisabilityCategories: _newDisability, oldDisabilityCategoriesList: _oldDisabilityList, disabilityCategories: _disabilityCategory, icd } });
      await personCol.updateOne({ _id: ObjectId(personId) }, { $set: { birthDate: moment().subtract(20, 'y').toDate() } });

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseId}/autoJudgeAA11`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result.isAA11a).toBe(false);
      expect(res.body.result.isAA11b).toBe(false);
      expect(res.body.result.isAA11aRemind).toBe(true);
      done();
    });
    test('[200]判斷個案身心障礙/失智症(isAA11aRemind判斷: 「身障類別」勾選"無"以外的項目 + 小於45歲)-成功', async (done) => {
      const _newDisability = [];
      const _oldDisabilityList = [];
      const _oldDisability = '01.視覺障礙';
      const _disabilityCategory = [];
      const icd = [];
      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      await carePlanCol.updateOne({ _id: ObjectId(carePlanId) }, { $set: { disabilityCategoryType: 1, newDisabilityCategories: _newDisability, oldDisabilityCategories: _oldDisability, oldDisabilityCategoriesList: _oldDisabilityList, disabilityCategories: _disabilityCategory, icd } });
      await personCol.updateOne({ _id: ObjectId(personId) }, { $set: { birthDate: moment().subtract(20, 'y').toDate() } });

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseId}/autoJudgeAA11`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result.isAA11a).toBe(false);
      expect(res.body.result.isAA11b).toBe(false);
      expect(res.body.result.isAA11aRemind).toBe(true);
      done();
    });
    test('[200]判斷個案身心障礙/失智症(isAA11aRemind判斷: 「身障類別」勾選"無"以外的項目 + 小於45歲)-成功', async (done) => {
      const _newDisability = [];
      const _oldDisabilityList = [];
      const _oldDisability = [];
      const _disabilityCategory = [0];
      const icd = [];
      const carePlanCol = NativeDBClient.getCollection(modelCodes.CAREPLAN);
      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      await carePlanCol.updateOne({ _id: ObjectId(carePlanId) }, { $set: { newDisabilityCategories: _newDisability, oldDisabilityCategories: _oldDisability, oldDisabilityCategoriesList: _oldDisabilityList, disabilityCategories: _disabilityCategory, icd } });
      await personCol.updateOne({ _id: ObjectId(personId) }, { $set: { birthDate: moment().subtract(20, 'y').toDate() } });

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${caseId}/autoJudgeAA11`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result.isAA11a).toBe(false);
      expect(res.body.result.isAA11b).toBe(false);
      expect(res.body.result.isAA11aRemind).toBe(false);
      done();
    });
  });
});