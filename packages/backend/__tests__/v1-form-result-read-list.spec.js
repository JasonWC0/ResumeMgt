/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-form-result-read-list.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-03-18 01:50:59 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const conf = require('@erpv3/app-common/shared/config');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testFormData = require('./seeder/data/form.json');
const testFormResultData = require('./seeder/data/form-result.json');
const testFormReviewStatusData = require('./seeder/data/form-review-status.json');
const Base = require('./basic/basic');
const App = require('../app');

function transObjectId(obj, fields) {
  const _obj = lodash.cloneDeep(obj);
  for(const field of fields) {
    const parts = field.split('.');
    if (parts.length === 1) {
      lodash.set(_obj, field, ObjectId(obj[field]));
      continue;
    }

    let value = lodash.cloneDeep(obj);
    for (let i = 0; i < parts.length; i++) {
      value = value[parts[i]];
    }
    lodash.set(_obj, field, ObjectId(value));
  }
  return _obj;
}

describe('讀取表單結果列表', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/formResults';
  let agent;
  let headers;

  const operator = {
    personId: testFormResultData.data[0].filler.personId,
    name: 'test',
    companyId: testFormResultData.data[0].companyId,
    region: 'TW',
  }
  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    // await Base.login(agent);

    headers = {
      vn: '',
      sc: 'Erpv3',
      companyId: 'testCompanyId',
      'X-Operator-Info': Buffer.from(JSON.stringify(operator)).toString('base64'),
    }
    headers[conf.REGISTER.KEY] = `Basic ${conf.REGISTER.CLIENTS[1].CLIENT_SECRET}`;
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:10505] 個案Id空白', async (done) => {
      const q = {
        caseId: '',
        t: testFormResultData.data[0].type,
        skip: 0,
        limit: 10,
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, {}, q);
      Base.verifyError(res, 10505, '個案Id空白');
      done();
    });
    test('[400:10507] 次類別空白', async (done) => {
      const q = {
        caseId: testFormResultData.data[0].caseId,
        t: '',
        skip: 0,
        limit: 10,
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, {}, q);
      Base.verifyError(res, 10507, '次類別空白');
      done();
    });
    test('[400:10008] 略過筆數空白', async (done) => {
      const q = {
        caseId: testFormResultData.data[0].caseId,
        t: testFormResultData.data[0].type,
        skip: null,
        limit: 10,
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, {}, q);
      Base.verifyError(res, 10008, '略過筆數空白');
      done();
    });
    test('[400:10009] 取得筆數空白', async (done) => {
      const q = {
        caseId: testFormResultData.data[0].caseId,
        t: testFormResultData.data[0].type,
        skip: 0,
        limit: null,
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, {}, q);
      Base.verifyError(res, 10009, '取得筆數空白');
      done();
    });
  });

  describe('成功', () => {
    beforeAll(async (done) => {
      const formResultCol = NativeDBClient.getCollection(modelCodes.FORMRESULT);
      const formResData = transObjectId(testFormResultData.data[0], ['_id', 'formId', 'companyId', 'caseId', 'filler.personId', 'creator', 'modifier']);
      formResData.fillDate = new Date(formResData.fillDate);
      formResData.submittedAt = new Date(formResData.submittedAt);
      const formResData2 = transObjectId(testFormResultData.data[3], ['_id', 'formId', 'companyId', 'caseId', 'filler.personId', 'creator', 'modifier']);
      formResData2.fillDate = new Date(formResData2.fillDate);
      formResData2.submittedAt = new Date(formResData2.submittedAt);
      const formResData3 = transObjectId(testFormResultData.data[4], ['_id', 'formId', 'companyId', 'caseId', 'filler.personId', 'creator', 'modifier']);
      formResData3.fillDate = new Date(formResData3.fillDate);
      formResData3.submittedAt = new Date(formResData3.submittedAt);
      const formResData4 = transObjectId(testFormResultData.data[1], ['_id', 'formId', 'companyId', 'caseId', 'filler.personId', 'creator', 'modifier']);
      formResData4.fillDate = new Date(formResData4.fillDate);
      formResData4.submittedAt = new Date(formResData4.submittedAt);
      const formResData5 = transObjectId(testFormResultData.data[2], ['_id', 'formId', 'companyId', 'caseId', 'filler.personId', 'creator', 'modifier']);
      formResData5.fillDate = new Date(formResData5.fillDate);
      formResData5.submittedAt = new Date(formResData5.submittedAt);
      await formResultCol.insertMany([formResData, formResData2, formResData3, formResData4, formResData5]);

      const reviewStatusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const reviewStatusData = transObjectId(testFormReviewStatusData.data[0], ['_id', 'fid']);
      const reviewStatusData2 = transObjectId(testFormReviewStatusData.data[2], ['_id', 'fid']);
      const reviewStatusData3 = transObjectId(testFormReviewStatusData.data[3], ['_id', 'fid']);
      const reviewStatusData4 = transObjectId(testFormReviewStatusData.data[1], ['_id', 'fid']);
      const reviewStatusData5 = transObjectId(testFormReviewStatusData.data[4], ['_id', 'fid']);
      await reviewStatusCol.insertMany([reviewStatusData, reviewStatusData2, reviewStatusData3, reviewStatusData4, reviewStatusData5]);
      done();
    });

    test('[200] 讀取表單結果列表-成功', async (done) => {
      const q = {
        caseId: testFormResultData.data[0].caseId,
        t: testFormResultData.data[0].type,
        skip: 0,
        limit: 10,
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, {}, q);

      expect(res.status).toBe(200);
      expect(res.body.result.list[0].fid).toBe(testFormResultData.data[1]._id);
      expect(res.body.result.list[0].formId).toBe(testFormResultData.data[1].formId);
      expect(res.body.result.list[0].version).toBe(testFormData.data[1].version);
      expect(res.body.result.list[0].type).toBe(testFormResultData.data[1].type);
      expect(res.body.result.list[0].fillDate).toBe(testFormResultData.data[1].fillDate);
      expect(res.body.result.list[0].fillerName).toBe(testFormResultData.data[1].filler.name);
      expect(res.body.result.list[0].submittedAt).toBe(testFormResultData.data[1].submittedAt);
      expect(res.body.result.list[0].reviewerName).toBe("");
      expect(res.body.result.list[0].reviewStatus).toBe(testFormReviewStatusData.data[1].status);
      expect(res.body.result.list[0].reviewComment).toBe("");
      done();
    });
    test('[200] 讀取表單結果列表(詳細)-成功', async (done) => {
      const q = {
        t: testFormResultData.data[3].type,
        detail: true,
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[7].category}`, headers, {}, q);

      expect(res.status).toBe(200);
      expect(res.body.result.list).toHaveLength(2);
      expect(res.body.result.list[0].caseId).toEqual(expect.anything());
      expect(res.body.result.list[0].result).toEqual(expect.anything());
      done();
    });
    test('[200] 讀取表單結果列表(詳細&區間)-成功', async (done) => {
      const q = {
        caseId: testFormResultData.data[0].caseId,
        t: testFormResultData.data[0].type,
        f: '2022/03/01',
        e: '2022/03/31',
        order:'fillDate',
        detail: true,
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, {}, q);

      expect(res.status).toBe(200);
      expect(res.body.result.list).toHaveLength(3);
      expect(res.body.result.list[0].caseId).toEqual(testFormResultData.data[0].caseId);
      expect(res.body.result.list[0].fillDate).toEqual(testFormResultData.data[0].fillDate);
      expect(res.body.result.list[0].result).toEqual(testFormResultData.data[0].result);
      expect(res.body.result.list[0].fillerPersonId).toEqual(testFormResultData.data[0].filler.personId);
      done();
    });
    test('[200] 讀取表單結果列表(pick&區間)-成功', async (done) => {
      const q = {
        caseId: testFormResultData.data[0].caseId,
        t: testFormResultData.data[0].type,
        f: '2022/03/01',
        e: '2022/03/31',
        order:'fillDate',
        pick: 'sum',
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, {}, q);

      expect(res.status).toBe(200);
      expect(res.body.result.list).toHaveLength(3);
      expect(res.body.result.list[0].fillDate).toEqual(testFormResultData.data[0].fillDate);
      expect(res.body.result.list[0].pick).toEqual(testFormResultData.data[0].result.sum);
      done();
    });
  });
});
