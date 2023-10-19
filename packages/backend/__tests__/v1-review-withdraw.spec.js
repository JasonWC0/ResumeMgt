/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-review-withdraw.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-13 03:26:56 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const moment = require('moment');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testAccountData = require('./seeder/data/account.json').data[0];
const testFormResultData = require('./seeder/data/form-result.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('審核撤回', () => {
  const _ENDPOINT = '/main/app/api/v1/reviewForms';
  let agent;
  let loginData;
  let sid1;
  let sid2;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    loginData = await Base.login(agent);

    // 準備資料
    // 正常資料
    const frfaFormData = {
      _id: ObjectId('6281ef8a78c1fa5dfd232e98'),
      clientDomain: 'ERPv3',
      serviceTypes: ['HC', 'DC', 'RC'],
      companyId: ObjectId('6209f7102dde25cae862482d'),
      category: 'evaluation',
      type: 'frfa',
      version: 'v1.00',
      name: '跌倒危險因子評估表',
      reviewType: 1,
      frequency: '',
      reviewRoles: [[1, 3]],
      displayGroup: '',
      fillRoles: [],
      viewRoles: [],
      inUse: true,
      valid: true,
      __cc: '',
      __vn: 0,
      __sc: 'Erpv3'
    }
    const frfaFormResData = {
      _id: ObjectId('6281efded23e9caf8104335b'),
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      formId: frfaFormData._id,
      category: frfaFormData.category,
      type: frfaFormData.type,
      caseId: ObjectId(testFormResultData[0].caseId),
      caseName: '個案姓名',
      fillDate: moment(testFormResultData[0].fillDate).format('YYYY/MM/DD'),
      filler: {
        personId: testFormResultData[0].filler.personId,
        name: testFormResultData[0].filler.name,
      },
      result: testFormResultData[0].result,
      creator: ObjectId(testFormResultData[0].creator),
      modifier: ObjectId(testFormResultData[0].modifier),
      submittedAt: testFormResultData[0].submittedAt,
      valid: true,
      __vn: 0,
      __cc: '',
      __sc: 'Erpv3',
    }
    const frfaHistData = [{
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      category: frfaFormData.category,
      type: frfaFormData.type,
      fid: frfaFormResData._id,
      status: 1,
      comment: '',
      content: '',
      submitter: {
        personId: ObjectId(testAccountData.personId),
        name: '管理員',
      },
      fillerName: testFormResultData[0].filler.name,
      submittedAt: testFormResultData[0].submittedAt,
      valid: true,
      __vn: 0,
      __cc: '',
      __sc: 'Erpv3',
    }]
    const frfaStatusData = {
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      fid: frfaFormResData._id,
      category: frfaFormData.category,
      type: frfaFormData.type,
      reviewRoles: [[1, 3]],
      reviewers: [],
      layerAt: 0,
      nowReviewRole: [1, 3],
      nowReviewer: [],
      status: 1,
      comment: '',
      lastReviewerName: '',
      content: '',
      fillerName: testFormResultData[0].filler.name,
      submittedAt: testFormResultData[0].submittedAt,
      valid: true,
      __vn: 0,
      __cc: '',
      __sc: 'Erpv3',
    }
    // 審核狀態有誤資料 sid2
    const adlFormData = {
      _id: ObjectId('62831414018674cc1f5e072f'),
      clientDomain: 'ERPv3',
      serviceTypes: ['HC', 'DC', 'RC'],
      companyId: ObjectId('6209f7102dde25cae862482d'),
      category: 'evaluation',
      type: 'adl',
      version: 'v1.00',
      name: '跌倒危險因子評估表',
      reviewType: 1,
      frequency: '',
      reviewRoles: [[1, 3]],
      displayGroup: '',
      fillRoles: [],
      viewRoles: [],
      inUse: true,
      valid: true,
      __cc: '',
      __vn: 0,
      __sc: 'Erpv3'
    }
    const adlFormResData = {
      _id: ObjectId('62831281917623e18f2fb884'),
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      formId: adlFormData._id,
      category: adlFormData.category,
      type: adlFormData.type,
      caseId: ObjectId(testFormResultData[0].caseId),
      caseName: '個案姓名',
      fillDate: moment(testFormResultData[0].fillDate).format('YYYY/MM/DD'),
      filler: {
        personId: testFormResultData[0].filler.personId,
        name: testFormResultData[0].filler.name,
      },
      result: testFormResultData[0].result,
      creator: ObjectId(testFormResultData[0].creator),
      modifier: ObjectId(testFormResultData[0].modifier),
      submittedAt: testFormResultData[0].submittedAt,
      valid: true,
      __vn: 0,
      __cc: '',
      __sc: 'Erpv3',
    }
    const adlHistData = [{
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      category: adlFormData.category,
      type: adlFormData.type,
      fid: adlFormResData._id,
      status: 1,
      comment: '',
      content: '',
      submitter: {
        personId: ObjectId(testAccountData.personId),
        name: '管理員',
      },
      fillerName: testFormResultData[0].filler.name,
      submittedAt: testFormResultData[0].submittedAt,
      valid: true,
      __vn: 0,
      __cc: '',
      __sc: 'Erpv3',
    },{
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      category: adlFormData.category,
      type: adlFormData.type,
      fid: adlFormResData._id,
      status: 4,
      comment: '',
      content: '',
      submitter: {
        personId: ObjectId(testAccountData.personId),
        name: '管理員',
      },
      fillerName: testFormResultData[0].filler.name,
      submittedAt: testFormResultData[0].submittedAt,
      valid: true,
      __vn: 0,
      __cc: '',
      __sc: 'Erpv3',
    }]
    const adlStatusData = {
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      fid: adlFormResData._id,
      category: adlFormData.category,
      type: adlFormData.type,
      reviewRoles: [[1, 3]],
      reviewers: [],
      layerAt: 0,
      nowReviewRole: [1, 3],
      nowReviewer: [],
      status: 4,
      comment: '',
      lastReviewerName: '',
      content: '',
      fillerName: testFormResultData[0].filler.name,
      submittedAt: testFormResultData[0].submittedAt,
      valid: true,
      __vn: 0,
      __cc: '',
      __sc: 'Erpv3',
    }

    const formCol = NativeDBClient.getCollection(modelCodes.FORM);
    const formResCol = NativeDBClient.getCollection(modelCodes.FORMRESULT);
    const statusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
    const historyCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);

    await formCol.insertMany([frfaFormData, adlFormData]);
    await formResCol.insertMany([frfaFormResData, adlFormResData]);
    await statusCol.insertMany([frfaStatusData, adlStatusData]);
    await historyCol.insertMany(frfaHistData);
    await historyCol.insertMany(adlHistData);
    const frfaStatusRes = await statusCol.findOne({ fid: frfaStatusData.fid, category: frfaStatusData.category, type: frfaStatusData.type });
    sid1 = frfaStatusRes._id.toString();
    const adlStatusRes = await statusCol.findOne({ fid: adlStatusData.fid, category: adlStatusData.category, type: adlStatusData.type });
    sid2 = adlStatusRes._id.toString();

    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('資料規則驗證', () => {
    test('[400:20508] 審核狀態鎖定', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/${sid2}/s/withdraw`)
        .send({ comment: '填寫不完整' })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20508,
        message: '審核狀態鎖定，無法變更',
        result: null,
      });
      done();
    });
    test('[400:90010] 資料版號有誤(低於現有版本)', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/${sid1}/s/withdraw`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: -1,
          sc: 'Erpv3',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 90010,
        message: 'Data vn fail',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test("[200] 審核撤回-成功", async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/${sid1}/s/withdraw`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: testFormResultData[0].companyId,
        });

      const statusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const statusRes = await statusCol.findOne({ _id: ObjectId(sid1) });
      const historyCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
      const histRes = await historyCol.find({ fid: ObjectId(statusRes.fid) }).toArray();

      expect(res.status).toBe(200);
      expect(statusRes.status).toBe(2);
      expect(statusRes.layerAt).toBe(null);
      expect(statusRes.__vn).toBe(1);
      expect(statusRes.__sc).toBe('Erpv3');
      expect(statusRes.__cc).toBe(res.body.traceId);
      expect(histRes.length).toBe(2);
      for (const hist of histRes) {
        if (hist.status === 2) {
          expect(hist.submitter.personId.toString()).toBe(testAccountData.personId);
          expect(hist.submitter.name).toBe('管理員');
        }
      }
      done();
    });
  });
});