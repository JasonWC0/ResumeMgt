/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-review-data-delete.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-17 06:50:23 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const conf = require('@erpv3/app-common/shared/config');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testFormResultData = require('./seeder/data/form-result.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('刪除審核資料', () => {
  const _ENDPOINT = '/main/app/api/v1/reviewForms';
  let agent;
  let id;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    const statusData = {
      _id: new ObjectId(),
      clientDomain: 'CACDI',
      companyId: new ObjectId(),
      fid: new ObjectId(),
      category: 'generalAffairs',
      type: 'type',
      reviewRoles: [],
      reviewers: [new ObjectId()],
      layerAt: 0,
      nowReviewRole: [],
      nowReviewer: '',
      status: 1,
      comment: '',
      lastReviewerName: '',
      content: 'content',
      fillerName: 'fillerName',
      submittedAt: new Date(),
      valid: true,
      __vn: 0,
      __cc: '',
      __sc: 'Sidea',
    }
    const histData = {
      _id: new ObjectId(),
      clientDomain: 'CACDI',
      companyId: statusData.companyId,
      category: statusData.category,
      type: statusData.type,
      fid: statusData.fid,
      status: 1,
      comment: '',
      content: 'content',
      submitter: {
        personId: new ObjectId(),
        name: '管理員',
      },
      fillerName: 'fillerName',
      submittedAt: statusData.submittedAt,
      valid: true,
      __vn: 0,
      __cc: '',
      __sc: 'Sidea',
    }
    statusData.nowReviewer = statusData.reviewers[0];
    const statusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
    const historyCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
    await statusCol.insertOne(statusData);
    await historyCol.insertOne(histData);
    id = statusData._id.toString();

    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test("[404:90008] 審核資料id不存在", async (done) => {
      const res = await agent
        .delete(`${_ENDPOINT}/ooooxxxxooooxxxx`)
        .set(conf.REGISTER.KEY, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          sc: 'Sidea',
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
  });

  describe('成功', () => {
    test("[200] 刪除審核資料-成功", async (done) => {
      const res = await agent
        .delete(`${_ENDPOINT}/${id}`)
        .set(conf.REGISTER.KEY, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      const statusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const statusRes = await statusCol.findOne({ _id: ObjectId(id) });

      expect(res.status).toBe(200);
      expect(statusRes.valid).toEqual(false);
      expect(statusRes.__cc).toBe(res.body.traceId);
      expect(statusRes.__sc).toBe('Sidea');
      expect(statusRes.__vn).toBe(1);
      done();
    });
  });
});