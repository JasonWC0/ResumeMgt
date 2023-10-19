/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-review-reject.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-13 03:26:34 pm
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

describe('審核駁回', () => {
  const _ENDPOINT = '/main/app/api/v1/reviewForms';
  let agent;
  let loginData;
  let sid1;
  let sid2;
  let sid3;

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
    // 正常資料 sid1
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
    // 審核角色資格有誤資料 sid2
    const mmseFormData = {
      _id: ObjectId('6281ede78ba50d8af458ca63'),
      clientDomain: 'ERPv3',
      serviceTypes: ['HC', 'DC', 'RC'],
      companyId: ObjectId('6209f7102dde25cae862482d'),
      category: 'evaluation',
      type: 'mmse',
      version: 'v1.00',
      name: '簡易智能量表(MMSE)',
      reviewType: 1,
      frequency: '',
      reviewRoles: [[10]],
      displayGroup: '',
      fillRoles: [],
      viewRoles: [],
      inUse: true,
      valid: true,
      __cc: '',
      __vn: 0,
      __sc: 'Erpv3'
    }
    const mmseFormResData = {
      _id: ObjectId('6281edfba8d19d9b004eb8d1'),
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      formId: mmseFormData._id,
      category: mmseFormData.category,
      type: mmseFormData.type,
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
    const mmseHistData = [{
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      category: mmseFormData.category,
      type: mmseFormData.type,
      fid: mmseFormResData._id,
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
    const mmseStatusData = {
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      fid: mmseFormResData._id,
      category: mmseFormData.category,
      type: mmseFormData.type,
      reviewRoles: [[10]],
      reviewers: [],
      layerAt: 0,
      nowReviewRole: [10],
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
    // 審核狀態有誤資料 sid3
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

    await formCol.insertMany([frfaFormData, mmseFormData, adlFormData]);
    await formResCol.insertMany([frfaFormResData, mmseFormResData, adlFormResData]);
    await statusCol.insertMany([frfaStatusData, mmseStatusData, adlStatusData]);
    await historyCol.insertMany(frfaHistData);
    await historyCol.insertMany(mmseHistData);
    await historyCol.insertMany(adlHistData);
    const frfaStatusRes = await statusCol.findOne({ fid: frfaStatusData.fid, category: frfaStatusData.category, type: frfaStatusData.type });
    sid1 = frfaStatusRes._id.toString();
    const mmseStatusRes = await statusCol.findOne({ fid: mmseStatusData.fid, category: mmseStatusData.category, type: mmseStatusData.type });
    sid2 = mmseStatusRes._id.toString();
    const adlStatusRes = await statusCol.findOne({ fid: adlStatusData.fid, category: adlStatusData.category, type: adlStatusData.type });
    sid3 = adlStatusRes._id.toString();

    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('資料規則驗證', () => {
    test('[404:90008] 沒有該可變更狀態', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/${sid1}/s/test`)
        .send({ comment: '填寫不完整' })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 90008,
        message: 'URI not found',
        result: null,
      });
      done();
    });
    test('[404:90008] 此sid不存在', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/ooooxxxxooooxxxx/s/reject`)
        .send({ comment: '填寫不完整' })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 90008,
        message: 'URI not found',
        result: null,
      });
      done();
    });
    test('[400:20509] 無權限變更審核狀態', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/${sid2}/s/reject`)
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
        code: 20509,
        message: '無權限變更審核狀態',
        result: null,
      });
      done();
    });
    test('[400:20508] 審核狀態鎖定', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/${sid3}/s/reject`)
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
        .patch(`${_ENDPOINT}/${sid1}/s/reject`)
        .send({ comment: '填寫不完整' })
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
    test("[200] 審核駁回-成功", async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/${sid1}/s/reject`)
        .send({ comment: '填寫不完整' })
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
      expect(statusRes.status).toBe(3);
      expect(statusRes.comment).toBe('填寫不完整');
      expect(statusRes.lastReviewerName).toBe('管理員');
      expect(statusRes.__vn).toBe(1);
      expect(statusRes.__sc).toBe('Erpv3');
      expect(statusRes.__cc).toBe(res.body.traceId);
      expect(histRes.length).toBe(2);
      for (const hist of histRes) {
        if (hist.status === 3) {
          expect(hist.comment).toBe('填寫不完整');
          expect(hist.submitter.personId.toString()).toBe(testAccountData.personId);
          expect(hist.submitter.name).toBe('管理員');
        }
      }
      done();
    });
  });
});