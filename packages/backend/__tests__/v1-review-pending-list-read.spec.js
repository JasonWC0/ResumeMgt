/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-review-pending-list-read.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-13 03:24:15 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const moment = require('moment');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testAccountData = require('./seeder/data/account.json').data[0];
const testFormResultData = require('./seeder/data/form-result.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('讀取該員工待審核表單列表', () => {
  const _ENDPOINT = '/main/app/api/v1/reviewForms/e/pending';
  let agent;
  let loginData;
  let frfaStatusData;

  const jsonData = {
    personId: testAccountData.personId,
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

    // 準備資料
    const adlFormData = {
      _id: ObjectId('6281eb382d9093ba137df175'),
      clientDomain: 'ERPv3',
      serviceTypes: ['HC', 'DC', 'RC'],
      companyId: ObjectId('6209f7102dde25cae862482d'),
      category: 'evaluation',
      type: 'adl',
      version: 'v1.00',
      name: '收托量表',
      reviewType: 1,
      frequency: '',
      reviewRoles: [[1]],
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
      _id: ObjectId('6281ebcb029f74bfa410e2c2'),
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
      reviewRoles: [[1]],
      reviewers: [],
      layerAt: 0,
      nowReviewRole: [],
      nowReviewer: [],
      status: 4,
      comment: '',
      lastReviewerName: '管理員',
      content: '',
      fillerName: testFormResultData[0].filler.name,
      submittedAt: testFormResultData[0].submittedAt,
      valid: true,
      __vn: 0,
      __cc: '',
      __sc: 'Erpv3',
    }
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
      reviewRoles: [[1]],
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
    },{
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      category: mmseFormData.category,
      type: mmseFormData.type,
      fid: mmseFormResData._id,
      status: 3,
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
      reviewRoles: [[1]],
      reviewers: [],
      layerAt: null,
      nowReviewRole: [],
      nowReviewer: [],
      status: 3,
      comment: '',
      lastReviewerName: '管理員',
      content: '',
      fillerName: testFormResultData[0].filler.name,
      submittedAt: testFormResultData[0].submittedAt,
      valid: true,
      __vn: 0,
      __cc: '',
      __sc: 'Erpv3',
    }
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
    frfaStatusData = {
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

    const formCol = NativeDBClient.getCollection(modelCodes.FORM);
    const formResCol = NativeDBClient.getCollection(modelCodes.FORMRESULT);
    const statusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
    const historyCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);

    await formCol.insertMany([adlFormData, mmseFormData, frfaFormData]);
    await formResCol.insertMany([adlFormResData, mmseFormResData, frfaFormResData]);
    await statusCol.insertMany([adlStatusData, mmseStatusData, frfaStatusData]);
    await historyCol.insertMany(adlHistData);
    await historyCol.insertMany(mmseHistData);
    await historyCol.insertMany(frfaHistData);

    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test("[400:10101] 個人ID空白", async (done) => {
      const _data = lodash.cloneDeep(jsonData);
      _data.personId = '';
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10101,
        message: '個人ID空白',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test("[200] 讀取該員工待審核表單列表-成功", async (done) => {
      const _data = lodash.cloneDeep(jsonData);
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(1);
      expect(res.body.result[0].fid).toBe(frfaStatusData.fid.toString());
      expect(res.body.result[0].category).toBe(frfaStatusData.category);
      expect(res.body.result[0].type).toBe(frfaStatusData.type);
      expect(res.body.result[0].fillerName).toBe(frfaStatusData.fillerName);
      expect(res.body.result[0].submittedAt).toBe(frfaStatusData.submittedAt);
      done();
    });
  });
});
