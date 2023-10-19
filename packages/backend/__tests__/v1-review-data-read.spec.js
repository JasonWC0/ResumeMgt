/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-review-data-read.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-17 06:58:04 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const conf = require('@erpv3/app-common/shared/config');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testFormResultData = require('./seeder/data/form-result.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('讀取審核資料', () => {
  const _ENDPOINT = '/main/app/api/v1/reviewForms';
  let agent;

  const statusData = {
    _id: new ObjectId(),
    clientDomain: 'CACDI',
    companyId: new ObjectId(),
    fid: new ObjectId(),
    category: 'generalAffairs',
    type: 'type',
    reviewRoles: [],
    reviewers: [new ObjectId().toHexString()],
    layerAt: 0,
    nowReviewRole: [],
    nowReviewer: null,
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

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);

    // init data
    statusData.nowReviewer = statusData.reviewers[0];
    const statusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
    await statusCol.insertOne(statusData);
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
        .get(`${_ENDPOINT}/ooooxxxxooooxxxx`)
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
    test("[200] 讀取審核資料-成功", async (done) => {
      const id = statusData._id.toString();
      const res = await agent
        .get(`${_ENDPOINT}/${id}`)
        .set(conf.REGISTER.KEY, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(200);
      expect(res.body.result.fid).toBe(statusData.fid.toString());
      expect(res.body.result.category).toBe(statusData.category);
      expect(res.body.result.type).toBe(statusData.type);
      expect(res.body.result.reviewRoles).toEqual(statusData.reviewRoles);
      expect(res.body.result.reviewers).toEqual(statusData.reviewers);
      expect(res.body.result.nowReviewRole).toEqual(statusData.nowReviewRole);
      expect(res.body.result.nowReviewer).toBe(statusData.nowReviewer);
      expect(res.body.result.status).toBe(statusData.status);
      expect(res.body.result.comment).toBe(statusData.comment);
      expect(res.body.result.fillerName).toBe(statusData.fillerName);
      expect(res.body.result.lastReviewerName).toBe(statusData.lastReviewerName);
      expect(res.body.result.vn).toBe(statusData.__vn);
      done();
    });
  });
});

