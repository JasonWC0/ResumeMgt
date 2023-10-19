/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-form-result-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-03-18 01:51:16 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const moment = require('moment');
const { ObjectId } = require('mongodb');
const conf = require('@erpv3/app-common/shared/config');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testFormData = require('./seeder/data/form.json');
const testFormResultData = require('./seeder/data/form-result.json');
const testFormReviewStatusData = require('./seeder/data/form-review-status.json');
const testFormReviewHistoryData = require('./seeder/data/form-review-history.json');
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

describe('更新表單結果', () => {
  const METHOD = 'PATCH';
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
      vn: testFormResultData.data[1].__vn,
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
    test('[400:10508] 填寫日期空白', async (done) => {
      const _data = {
        fillDate: '',
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        reviewerIds: [],
        result: { test: 'update' },
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}/${testFormResultData.data[0]._id}`, headers, _data);
      Base.verifyError(res, 10508, '填寫日期空白');
      done();
    });
    test('[400:10509] 填寫人Id空白', async (done) => {
      const _data = {
        fillDate: '2022/01/01',
        fillerId: '',
        fillerName: testFormResultData.data[0].filler.name,
        reviewerIds: [],
        result: { test: 'update' },
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}/${testFormResultData.data[0]._id}`, headers, _data);
      Base.verifyError(res, 10509, '填寫人Id空白');
      done();
    });
    test('[400:10510] 填寫人姓名空白', async (done) => {
      const _data = {
        fillDate: '2022/01/01',
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: '',
        reviewerIds: [],
        result: { test: 'update' },
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}/${testFormResultData.data[0]._id}`, headers, _data);
      Base.verifyError(res, 10510, '填寫人姓名空白');
      done();
    });
    test('[400:20505] 填寫日期格式有誤', async (done) => {
      const _data = {
        fillDate: 'test',
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        reviewerIds: [],
        result: { test: 'update' },
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}/${testFormResultData.data[0]._id}`, headers, _data);
      Base.verifyError(res, 20505, '填寫日期格式有誤');
      done();
    });
    test('[400:20513] 下次評估日期格式有誤 YYYY/MM/DD', async (done) => {
      const _data = {
        fillDate: '2022/01/01',
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        nextEvaluationDate: 'test',
        reviewerIds: [],
        result: { test: 'update' },
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}/${testFormResultData.data[0]._id}`, headers, _data);
      Base.verifyError(res, 20513, '下次評估日期格式有誤');
      done();
    });
    test('[400:10013] 檔案Id空白', async (done) => {
      const _data = {
        fillDate: '2022/01/01',
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        reviewerIds: [],
        files: [{
          publicUrl: 'publicUrl'
        }]
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}/${testFormResultData.data[0]._id}`, headers, _data);
      Base.verifyError(res, 10013, '檔案Id空白');
      done();
    });
    test('[400:10014] 檔案路徑空白', async (done) => {
      const _data = {
        fillDate: '2022/01/01',
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        reviewerIds: [],
        files: [{
          id: 'storageServiceId'
        }]
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}/${testFormResultData.data[0]._id}`, headers, _data);
      Base.verifyError(res, 10014, '檔案路徑空白');
      done();
    });
  });

  describe('資料規則驗證', () => {
    beforeAll(async (done) => {
      const formResultCol = NativeDBClient.getCollection(modelCodes.FORMRESULT);
      const formResData = transObjectId(testFormResultData.data[1], ['_id', 'formId', 'companyId', 'caseId', 'filler.personId', 'creator', 'modifier'])
      formResData.fillDate = new Date(formResData.fillDate);
      formResData.submittedAt = new Date(formResData.submittedAt);
      formResData.nextEvaluationDate = new Date(formResData.nextEvaluationDate);
      await formResultCol.insertOne(formResData);

      const reviewStatusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const reviewStatusData = transObjectId(testFormReviewStatusData.data[1], ['_id', 'fid']);
      await reviewStatusCol.insertOne(reviewStatusData);

      const reviewHistoryCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
      const reviewHistoryData = transObjectId(testFormReviewHistoryData.data[1], ['_id', 'fid']);
      await reviewHistoryCol.insertOne(reviewHistoryData);
      done();
    });

    test('[400:20001] 登入者和資料公司Id不同', async (done) => {
      const _operator = lodash.cloneDeep(operator);
      _operator.companyId = '62344650613886a0e31b83e7';
      const _headers = lodash.cloneDeep(headers);
      _headers['X-Operator-Info'] = Buffer.from(JSON.stringify(_operator)).toString('base64');
      const _data = {
        fillDate: '2022/01/01',
        fillerId: testFormResultData.data[1].filler.personId,
        fillerName: testFormResultData.data[1].filler.name,
        reviewerIds: [],
        result: { test: 'update' },
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormResultData.data[1].category}/${testFormResultData.data[1]._id}`, _headers, _data);
      Base.verifyError(res, 20001, '登入者和資料公司Id不同');
      done();
    });
    test('[400:20504] 表單結果的主類別和url不同', async (done) => {
      const _data = {
        fillDate: '2022/01/01',
        fillerId: testFormResultData.data[1].filler.personId,
        fillerName: testFormResultData.data[1].filler.name,
        reviewerIds: [],
        result: { test: 'update' },
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/iadl/${testFormResultData.data[1]._id}`, headers, _data);
      Base.verifyError(res, 20504, '表單結果的主類別不同');
      done();
    });
    test('[404:90008] 表單結果Id不存在', async (done) => {
      const _data = {
        fillDate: '2022/01/01',
        fillerId: testFormResultData.data[1].filler.personId,
        fillerName: testFormResultData.data[1].filler.name,
        reviewerIds: [],
        result: { test: 'update' },
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}/0000x0000x0000`, headers, _data);
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
      formResData.fillDate = new Date(formResData.fillDate);
      formResData.submittedAt = new Date(formResData.submittedAt);
      formResData.nextEvaluationDate = new Date(formResData.nextEvaluationDate);
      formResData.files[0].updatedAt = new Date(formResData.files[0].updatedAt);
      await formResultCol.insertOne(formResData);

      const reviewStatusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const reviewStatusData = transObjectId(testFormReviewStatusData.data[0], ['_id', 'fid']);
      await reviewStatusCol.insertOne(reviewStatusData);

      const reviewHistoryCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
      const reviewHistoryData = transObjectId(testFormReviewHistoryData.data[0], ['_id', 'fid']);
      await reviewHistoryCol.insertOne(reviewHistoryData);
      done();
    });

    test('[200]] 更新表單結果-成功', async (done) => {
      const _data = {
        fillDate: '2022/01/01',
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        nextEvaluationDate: '2022/07/01',
        reviewerIds: [],
        result: { test: 'update' },
        files:[{
          id: 'storageServiceId',
          publicUrl: 'https://storageServce.com',
          fileName: 'newname',
        }, {
          id: 'storageServiceId2',
          publicUrl: 'newUrl',
          fileName: 'fileName'
        }]
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}/${testFormResultData.data[0]._id}`, headers, _data);

      const formResultCol = NativeDBClient.getCollection(modelCodes.FORMRESULT);
      const formResultRes = await formResultCol.findOne({ _id: ObjectId(testFormResultData.data[0]._id), valid: true });
      const reviewStatusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const reviewStatusRes = await reviewStatusCol.findOne({ fid: ObjectId(testFormResultData.data[0]._id), valid: true });
      const reviewHistoryCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
      const reviewHistoryRes = await reviewHistoryCol.find({ fid: ObjectId(testFormResultData.data[0]._id), valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(formResultRes.fillDate).toEqual(moment(_data.fillDate, 'YYYY/MM/DD').toDate());
      expect(formResultRes.filler.personId.toString()).toBe(_data.fillerId);
      expect(formResultRes.filler.name).toBe(_data.fillerName);
      expect(formResultRes.nextEvaluationDate).toEqual(moment(_data.nextEvaluationDate, 'YYYY/MM/DD').toDate());
      expect(formResultRes.result).toEqual(_data.result);
      expect(formResultRes.files[0].id).toEqual(_data.files[0].id);
      expect(formResultRes.files[0].publicUrl).toEqual(_data.files[0].publicUrl);
      expect(formResultRes.files[0].fileName).toEqual(_data.files[0].fileName);
      expect(formResultRes.files[1].id).toEqual(_data.files[1].id);
      expect(formResultRes.files[1].publicUrl).toEqual(_data.files[1].publicUrl);
      expect(formResultRes.files[1].fileName).toEqual(_data.files[1].fileName);
      expect(formResultRes.creator.toString()).toBe(operator.personId);
      expect(formResultRes.modifier.toString()).toBe(operator.personId);
      expect(reviewStatusRes.status).toBe(5);
      expect(reviewHistoryRes.length).toBe(1);
      done();
    });
  });
});