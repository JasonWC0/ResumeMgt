/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-form-result-delete.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-03-18 01:51:31 pm
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

describe('刪除表單結果', () => {
  const _ENDPOINT = '/main/app/api/v1/formResults';
  let agent;

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
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('成功', () => {
    beforeAll(async (done) => {
      const formResultCol = NativeDBClient.getCollection(modelCodes.FORMRESULT);
      const formResData = transObjectId(testFormResultData.data[0], ['_id', 'formId', 'companyId', 'caseId', 'filler.personId', 'creator', 'modifier'])
      formResData.fillDate = new Date(formResData.fillDate);
      formResData.submittedAt = new Date(formResData.submittedAt);
      await formResultCol.insertOne(formResData);

      const reviewStatusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const reviewStatusData = transObjectId(testFormReviewStatusData.data[0], ['_id', 'fid']);
      await reviewStatusCol.insertOne(reviewStatusData);

      const reviewHistoryCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
      const reviewHistoryData = transObjectId(testFormReviewHistoryData.data[0], ['_id', 'fid']);
      await reviewHistoryCol.insertOne(reviewHistoryData);
      done();
    });

    test('[200] 刪除表單結果-成功', async (done) => {
      const res = await agent
        .delete(`${_ENDPOINT}/${testFormData.data[0].category}/${testFormResultData.data[0]._id}`)
        .set(conf.REGISTER.KEY, `Basic ${conf.REGISTER.CLIENTS[1].CLIENT_SECRET}`)
        .set('X-Operator-Info', Buffer.from(JSON.stringify(operator)).toString('base64'))
        .set({
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      const formResultCol = NativeDBClient.getCollection(modelCodes.FORMRESULT);
      const formResultRes = await formResultCol.findOne({ _id: ObjectId(testFormResultData.data[0]._id) });
      const reviewStatusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const reviewStatusRes = await reviewStatusCol.findOne({ fid: ObjectId(testFormResultData.data[0]._id) });

      expect(res.status).toBe(200);
      expect(formResultRes.valid).toBe(false);
      expect(reviewStatusRes.valid).toBe(false);
      done();
    });
  });
});