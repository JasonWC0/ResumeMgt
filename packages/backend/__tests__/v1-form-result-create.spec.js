/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-form-result-create.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-03-18 01:49:45 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const moment = require('moment');
const { ObjectId } = require('mongodb');
const conf = require('@erpv3/app-common/shared/config');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testFormData = require('./seeder/data/form.json');
const testFormResultData = require('./seeder/data/form-result.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('創建表單結果', () => {
  const METHOD = 'POST';
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
    test('[400:10511] 表單範本Id空白', async (done) => {
      const _data = {
        formId: '',
        caseId: testFormResultData.data[0].caseId,
        caseName: '個案姓名',
        fillDate: moment(testFormResultData.data[0].fillDate).format('YYYY/MM/DD'),
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        reviewerIds: [],
        result: testFormResultData.data[0].result
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, _data);
      Base.verifyError(res, 10511, '表單範本Id空白');
      done();
    });
    test('[400:10010] 個案Id空白', async (done) => {
      const _data = {
        formId: testFormResultData.data[0].formId,
        caseId: '',
        caseName: '個案姓名',
        fillDate: moment(testFormResultData.data[0].fillDate).format('YYYY/MM/DD'),
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        reviewerIds: [],
        result: testFormResultData.data[0].result,
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, _data);
      Base.verifyError(res, 10010, '個案Id空白');
      done();
    });
    test('[400:10512] 個案姓名空白', async (done) => {
      const _data = {
        formId: testFormResultData.data[0].formId,
        caseId: testFormResultData.data[0].caseId,
        caseName: '',
        fillDate: moment(testFormResultData.data[0].fillDate).format('YYYY/MM/DD'),
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        reviewerIds: [],
        result: testFormResultData.data[0].result,
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, _data);
      Base.verifyError(res, 10512, '個案姓名空白');
      done();
    });
    test('[400:10508] 填寫日期空白', async (done) => {
      const _data = {
        formId: testFormResultData.data[0].formId,
        caseId: testFormResultData.data[0].caseId,
        caseName: '個案姓名',
        fillDate: '',
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        reviewerIds: [],
        result: testFormResultData.data[0].result,
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, _data);
      Base.verifyError(res, 10508, '填寫日期空白');
      done();
    });
    test('[400:10509] 填寫人Id空白', async (done) => {
      const _data = {
        formId: testFormResultData.data[0].formId,
        caseId: testFormResultData.data[0].caseId,
        caseName: '個案姓名',
        fillDate: moment(testFormResultData.data[0].fillDate).format('YYYY/MM/DD'),
        fillerId: '',
        fillerName: testFormResultData.data[0].filler.name,
        reviewerIds: [],
        result: testFormResultData.data[0].result,
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, _data);
      Base.verifyError(res, 10509, '填寫人Id空白');
      done();
    });
    test('[400:10510] 填寫人姓名空白', async (done) => {
      const _data = {
        formId: testFormResultData.data[0].formId,
        caseId: testFormResultData.data[0].caseId,
        caseName: '個案姓名',
        fillDate: moment(testFormResultData.data[0].fillDate).format('YYYY/MM/DD'),
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: '',
        reviewerIds: [],
        result: testFormResultData.data[0].result,
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, _data);
      Base.verifyError(res, 10510, '填寫人姓名空白');
      done();
    });
    test('[400:20505] 填寫日期格式有誤', async (done) => {
      const _data = {
        formId: testFormResultData.data[0].formId,
        caseId: testFormResultData.data[0].caseId,
        caseName: '個案姓名',
        fillDate: '3000/14/01',
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        reviewerIds: [],
        result: testFormResultData.data[0].result,
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, _data);
      Base.verifyError(res, 20505, '填寫日期格式有誤');
      done();
    });
    test('[400:20513] 下次評估日期格式有誤 YYYY/MM/DD', async (done) => {
      const _data = {
        formId: testFormResultData.data[0].formId,
        caseId: testFormResultData.data[0].caseId,
        caseName: '個案姓名',
        fillDate: moment(testFormResultData.data[0].fillDate).format('YYYY/MM/DD'),
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        nextEvaluationDate: 'test',
        reviewerIds: [],
        result: testFormResultData.data[0].result,
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, _data);
      Base.verifyError(res, 20513, '下次評估日期格式有誤');
      done();
    });
    test('[400:10013] 檔案Id空白', async (done) => {
      const _data = {
        formId: testFormResultData.data[0].formId,
        caseId: testFormResultData.data[0].caseId,
        caseName: '個案姓名',
        fillDate: moment(testFormResultData.data[0].fillDate).format('YYYY/MM/DD'),
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        reviewerIds: [],
        files: [{
          publicUrl: 'publicUrl'
        }]
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, _data);
      Base.verifyError(res, 10013, '檔案Id空白');
      done();
    });
    test('[400:10014] 檔案路徑空白', async (done) => {
      const _data = {
        formId: testFormResultData.data[0].formId,
        caseId: testFormResultData.data[0].caseId,
        caseName: '個案姓名',
        fillDate: moment(testFormResultData.data[0].fillDate).format('YYYY/MM/DD'),
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        reviewerIds: [],
        files: [{
          id: 'storageServiceId'
        }]
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, _data);
      Base.verifyError(res, 10014, '檔案路徑空白');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 創建表單結果-成功', async (done) => {
      const _data = {
        formId: testFormResultData.data[0].formId,
        caseId: testFormResultData.data[0].caseId,
        caseName: '個案姓名',
        fillDate: moment(testFormResultData.data[0].fillDate).format('YYYY/MM/DD'),
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        nextEvaluationDate: testFormResultData.data[0].nextEvaluationDate,
        reviewerIds: [],
        result: testFormResultData.data[0].result,
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, _data);

      const formResultCol = NativeDBClient.getCollection(modelCodes.FORMRESULT);
      const formResultRes = await formResultCol.findOne({ _id: ObjectId(res.body.result.id), valid: true });
      const reviewStatusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const reviewStatusRes = await reviewStatusCol.findOne({ fid: ObjectId(res.body.result.id), valid: true });
      const reviewHistoryCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
      const reviewHistoryRes = await reviewHistoryCol.find({ fid: ObjectId(res.body.result.id), valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(formResultRes.formId.toString()).toBe(_data.formId);
      expect(formResultRes.caseId.toString()).toBe(_data.caseId);
      expect(formResultRes.fillDate).toEqual(moment(_data.fillDate, 'YYYY/MM/DD').toDate());
      expect(formResultRes.filler.personId.toString()).toBe(_data.fillerId);
      expect(formResultRes.filler.name).toBe(_data.fillerName);
      expect(formResultRes.nextEvaluationDate).toEqual(moment(_data.nextEvaluationDate, 'YYYY/MM/DD').toDate());
      expect(formResultRes.result).toEqual(_data.result);
      expect(formResultRes.creator.toString()).toBe(operator.personId);
      expect(formResultRes.modifier.toString()).toBe(operator.personId);
      expect(reviewStatusRes.status).toBe(5);
      expect(reviewHistoryRes.length).toBe(1);
      done();
    });
    test('[200] 創建表單結果(檔案)-成功', async (done) => {
      const _data = {
        formId: testFormResultData.data[0].formId,
        caseId: testFormResultData.data[0].caseId,
        caseName: '個案姓名',
        fillDate: moment(testFormResultData.data[0].fillDate).format('YYYY/MM/DD'),
        fillerId: testFormResultData.data[0].filler.personId,
        fillerName: testFormResultData.data[0].filler.name,
        nextEvaluationDate: testFormResultData.data[0].nextEvaluationDate,
        reviewerIds: [],
        result: {},
        files:[
          {
            id: 'storageServiceId',
            fileName: '檔案名稱',
            publicUrl: 'publicUrl',
            mimeType: 'pdf'
          }
        ]
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testFormData.data[0].category}`, headers, _data);

      const formResultCol = NativeDBClient.getCollection(modelCodes.FORMRESULT);
      const formResultRes = await formResultCol.findOne({ _id: ObjectId(res.body.result.id), valid: true });
      const reviewStatusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const reviewStatusRes = await reviewStatusCol.findOne({ fid: ObjectId(res.body.result.id), valid: true });
      const reviewHistoryCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
      const reviewHistoryRes = await reviewHistoryCol.find({ fid: ObjectId(res.body.result.id), valid: true }).toArray();

      expect(res.status).toBe(200);
      expect(formResultRes.formId.toString()).toBe(_data.formId);
      expect(formResultRes.caseId.toString()).toBe(_data.caseId);
      expect(formResultRes.fillDate).toEqual(moment(_data.fillDate, 'YYYY/MM/DD').toDate());
      expect(formResultRes.filler.personId.toString()).toBe(_data.fillerId);
      expect(formResultRes.filler.name).toBe(_data.fillerName);
      expect(formResultRes.nextEvaluationDate).toEqual(moment(_data.nextEvaluationDate, 'YYYY/MM/DD').toDate());
      expect(formResultRes.files[0].id).toBe(_data.files[0].id);
      expect(formResultRes.files[0].fileName).toBe(_data.files[0].fileName);
      expect(formResultRes.files[0].publicUrl).toBe(_data.files[0].publicUrl);
      expect(formResultRes.files[0].mimeType).toBe(_data.files[0].mimeType);
      expect(formResultRes.creator.toString()).toBe(operator.personId);
      expect(formResultRes.modifier.toString()).toBe(operator.personId);
      expect(reviewStatusRes.status).toBe(5);
      expect(reviewHistoryRes.length).toBe(1);
      done();
    });
  });
});