/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-form-result-read.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-03-18 01:50:25 pm
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

describe('讀取表單結果', () => {
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

  describe('資料規則驗證', () => {
    beforeAll(async (done) => {
      const formResultCol = NativeDBClient.getCollection(modelCodes.FORMRESULT);
      const formResData = transObjectId(testFormResultData.data[1], ['_id', 'formId', 'companyId', 'caseId', 'filler.personId', 'creator', 'modifier'])
      formResData.fillDate = new Date(formResData.fillDate);
      formResData.submittedAt = new Date(formResData.submittedAt);
      await formResultCol.insertOne(formResData);

      const reviewStatusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const reviewStatusData = transObjectId(testFormReviewStatusData.data[1], ['_id', 'fid']);
      await reviewStatusCol.insertOne(reviewStatusData);
      done();
    });

    test('[400:20001] 登入者和資料公司Id不同', async (done) => {
      const _operator = lodash.cloneDeep(operator);
      _operator.companyId = '62344650613886a0e31b83e7';
      const _headers = lodash.cloneDeep(headers);
      _headers['X-Operator-Info'] = Buffer.from(JSON.stringify(_operator)).toString('base64');
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormResultData.data[1].category}/${testFormResultData.data[1]._id}`, _headers);
      Base.verifyError(res, 20001, '登入者和資料公司Id不同');
      done();
    });
    test('[400:20504] 表單結果的主類別和url不同', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/test/${testFormResultData.data[1]._id}`, headers);
      Base.verifyError(res, 20504, '表單結果的主類別不同');
      done();
    });
    test('[404:90008] 表單結果Id不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}/0000x0000x0000`, headers);
      expect(res.status).toBe(404);
      expect(res.body.code).toBe(90008);
      expect(res.body.message).toBe('URI not found');
      done();
    });
  });

  describe('成功', () => {
    beforeAll(async (done) => {
      const formResultCol = NativeDBClient.getCollection(modelCodes.FORMRESULT);
      const formResData = transObjectId(testFormResultData.data[0], ['_id', 'formId', 'companyId', 'caseId', 'filler.personId', 'creator', 'modifier'])
      formResData.signatures.forEach((v) => ObjectId(v));
      formResData.fillDate = new Date(formResData.fillDate);
      formResData.submittedAt = new Date(formResData.submittedAt);
      await formResultCol.insertOne(formResData);

      const reviewStatusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const reviewStatusData = transObjectId(testFormReviewStatusData.data[0], ['_id', 'fid']);
      await reviewStatusCol.insertOne(reviewStatusData);
      done();
    });

    test('[200] 讀取表單結果-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}/${testFormResultData.data[0]._id}`, headers);

      expect(res.status).toBe(200);
      expect(res.body.result.fid).toBe(testFormResultData.data[0]._id);
      expect(res.body.result.sid).toBe(testFormReviewStatusData.data[0]._id);
      expect(res.body.result.category).toBe(testFormResultData.data[0].category);
      expect(res.body.result.type).toBe(testFormResultData.data[0].type);
      expect(res.body.result.version).toBe(testFormData.data[1].version);
      expect(res.body.result.name).toBe(testFormData.data[1].name);
      expect(res.body.result.reviewType).toEqual(testFormData.data[1].reviewType);
      expect(res.body.result.reviewStatus).toBe(testFormReviewStatusData.data[0].status);
      expect(res.body.result.fillDate).toEqual(testFormResultData.data[0].fillDate);
      expect(res.body.result.filler).toEqual(testFormResultData.data[0].filler);
      expect(res.body.result.reviewRoles).toEqual(testFormData.data[1].reviewRoles);
      expect(res.body.result.result).toEqual(testFormResultData.data[0].result);
      expect(res.body.result.signatures.map((v)=>v._id)).toEqual(testFormResultData.data[0].signatures);
      done();
    });
  });
});
