/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-review-approve-list.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-17 01:29:58 pm
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

describe('批次審核通過', () => {
  const _ENDPOINT = '/main/app/api/v1/reviewForms/s/approve';
  let agent;
  let loginData;
  let sid1;
  let sid2;
  let sid3;
  let sid4;

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
    // 一層審核結束 sid1
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
    // 兩層審核結束 sid2
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
      reviewRoles: [[1], [10]],
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
      reviewRoles: [[1], [10]],
      reviewers: [],
      layerAt: 0,
      nowReviewRole: [1],
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
    // 審核角色資格有誤資料 sid3
    const spmsqFormData = {
      _id: ObjectId('62831735acf62638316712f5'),
      clientDomain: 'ERPv3',
      serviceTypes: ['HC', 'DC', 'RC'],
      companyId: ObjectId('6209f7102dde25cae862482d'),
      category: 'evaluation',
      type: 'spmsq',
      version: 'v1.00',
      name: '失智症篩檢量表(SPMSQ)',
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
    const spmsqFormResData = {
      _id: ObjectId('6283175ad5d6b1631d6db8cc'),
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      formId: spmsqFormData._id,
      category: spmsqFormData.category,
      type: spmsqFormData.type,
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
    const spmsqHistData = [{
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      category: spmsqFormData.category,
      type: spmsqFormData.type,
      fid: spmsqFormResData._id,
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
    const spmsqStatusData = {
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      fid: spmsqFormResData._id,
      category: spmsqFormData.category,
      type: spmsqFormData.type,
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
    // 審核狀態有誤資料 sid4
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
      status: 2,
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
      layerAt: null,
      nowReviewRole: [],
      nowReviewer: [],
      status: 2,
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

    await formCol.insertMany([frfaFormData, mmseFormData, spmsqFormData, adlFormData]);
    await formResCol.insertMany([frfaFormResData, mmseFormResData, spmsqFormResData, adlFormResData]);
    await statusCol.insertMany([frfaStatusData, mmseStatusData, spmsqStatusData, adlStatusData]);
    await historyCol.insertMany(frfaHistData);
    await historyCol.insertMany(mmseHistData);
    await historyCol.insertMany(spmsqHistData);
    await historyCol.insertMany(adlHistData);
    const frfaStatusRes = await statusCol.findOne({ fid: frfaStatusData.fid, category: frfaStatusData.category, type: frfaStatusData.type });
    sid1 = frfaStatusRes._id.toString();
    const mmseStatusRes = await statusCol.findOne({ fid: mmseStatusData.fid, category: mmseStatusData.category, type: mmseStatusData.type });
    sid2 = mmseStatusRes._id.toString();
    const spmsqStatusRes = await statusCol.findOne({ fid: spmsqStatusData.fid, category: spmsqStatusData.category, type: spmsqStatusData.type });
    sid3 = spmsqStatusRes._id.toString();
    const adlStatusRes = await statusCol.findOne({ fid: adlStatusData.fid, category: adlStatusData.category, type: adlStatusData.type });
    sid4 = adlStatusRes._id.toString();

    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test("[400:10520] 批次審核通過資料列表空白", async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send({ data: [] })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10520,
        message: '批次審核資料空白',
        result: null,
      });
      done();
    });
    test("[400:10514] 批次審核通過-其中表單狀態Id空白", async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send({ data: [{ id: '', vn: 0 },] })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10514,
        message: '表單狀態Id空白',
        result: null,
      });
      done();
    });
    test("[400:10018] 批次審核通過-其中表單狀態vn空白", async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send({ data: [{ id: 'test', vn: '' },] })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10018,
        message: 'vn空白',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test("[200] 批次審核通過-成功", async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send({ data: [
          { id: sid1, vn: 0 },
          { id: sid2, vn: 0 },
          { id: sid3, vn: -1 },
          { id: sid4, vn: 0 },
          { id:'test', vn: 0 }] })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: 0,
          sc: 'Erpv3',
          companyId: testFormResultData[0].companyId,
        });

      const statusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const statusRes1 = await statusCol.findOne({ _id: ObjectId(sid1) });
      const statusRes2 = await statusCol.findOne({ _id: ObjectId(sid2) });
      const historyCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
      const histRes1 = await historyCol.find({ fid: ObjectId(statusRes1.fid) }).toArray();
      const histRes2 = await historyCol.find({ fid: ObjectId(statusRes2.fid) }).toArray();

      expect(res.status).toBe(200);
      expect(res.body.result.success.length).toBe(2);
      expect(res.body.result.fail.length).toBe(3);
      expect(statusRes1.status).toBe(4);
      expect(statusRes1.lastReviewerName).toBe('管理員');
      expect(statusRes1.__vn).toBe(1);
      expect(statusRes1.__sc).toBe('Erpv3');
      expect(statusRes1.__cc).toBe(res.body.traceId);
      expect(statusRes2.status).toBe(1);
      expect(statusRes2.lastReviewerName).toBe('管理員');
      expect(statusRes2.layerAt).toBe(1);
      expect(statusRes2.nowReviewRole).toEqual([10]);
      expect(statusRes2.__vn).toBe(1);
      expect(statusRes2.__sc).toBe('Erpv3');
      expect(statusRes2.__cc).toBe(res.body.traceId);
      expect(histRes1.length).toBe(2);
      expect(histRes2.length).toBe(2);
      for (const hist of histRes1) {
        if (hist.status === 4) {
          expect(hist.submitter.personId.toString()).toBe(testAccountData.personId);
          expect(hist.submitter.name).toBe('管理員');
        }
      }
      for (const hist of histRes2) {
        if (hist.status === 4) {
          expect(hist.submitter.personId.toString()).toBe(testAccountData.personId);
          expect(hist.submitter.name).toBe('管理員');
        }
      }
      done();
    });
  });
});