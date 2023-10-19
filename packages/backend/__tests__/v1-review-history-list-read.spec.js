/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-review-history-list-read.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-13 03:23:02 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const moment = require('moment');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testAccountData = require('./seeder/data/account.json').data[0];
const testFormData = require('./seeder/data/form.json').data;
const testFormResultData = require('./seeder/data/form-result.json').data;
const testReviewStatusData = require('./seeder/data/form-review-status.json').data;
const testReviewHistoryData = require('./seeder/data/form-review-history.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('讀取表單審核歷程', () => {
  const _ENDPOINT = '/main/app/api/v1/reviewForms/f/history';
  let agent;
  let loginData;
  let fid;

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
    const formResData = {
      _id: ObjectId(testFormResultData[0]._id),
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      formId: ObjectId(testFormResultData[0].formId),
      category: testFormResultData[0].category,
      type: testFormResultData[0].type,
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
    const histData = {
      clientDomain: 'ERPv3',
      category: testReviewHistoryData[0].category,
      type: testReviewHistoryData[0].type,
      fid: ObjectId(testReviewHistoryData[0].fid),
      status: 5,
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
    }
    const statusData = {
      clientDomain: 'ERPv3',
      companyId: ObjectId(testFormResultData[0].companyId),
      fid: ObjectId(testReviewHistoryData[0].fid),
      category: testReviewStatusData[0].category,
      type: testReviewStatusData[0].type,
      reviewRoles: [],
      reviewers: [],
      layerAt: null,
      nowReviewRole: [],
      nowReviewer: [],
      status: 5,
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
    const formResCol = NativeDBClient.getCollection(modelCodes.FORMRESULT);
    const historyCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
    const statusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);

    await formResCol.insertOne(formResData);
    const formRes = await formResCol.findOne({ companyId: ObjectId(formResData.companyId), formId: ObjectId(formResData.formId), category: formResData.category, type: formResData.type});
    await historyCol.insertOne(histData);
    await statusCol.insertOne(statusData);
    fid = formRes._id.toString();

    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test("[400:10513] id 空白", async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({
          id: '',
          c: testFormData[1].category,
          t: testFormData[1].type
        })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10513,
        message: '表單結果Id空白',
        result: null,
      });
      done();
    });
    test("[400:10506] category 空白", async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({
          id: fid,
          c: '',
          t: testFormData[1].type
        })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10506,
        message: '主類別空白',
        result: null,
      });
      done();
    });
    test("[400:10507] type 空白", async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({
          id: fid,
          c: testFormData[1].category,
          t: '',
        })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10507,
        message: '次類別空白',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test("[200] 讀取表單審核歷程-成功", async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({
          id: fid,
          c: testFormData[1].category,
          t: testFormData[1].type
        })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(1);
      expect(res.body.result[0].name).toBe('管理員');
      expect(res.body.result[0].comment).toBe('');
      expect(res.body.result[0].status).toBe(5);
      expect(res.body.result[0].submittedAt).not.toBeNull();
      expect(res.body.result[0].submittedAt).not.toBeUndefined();
      expect(res.body.result[0].submittedAt).not.toBeNaN();

      done();
    });
  });
});