/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-review-data-read-list.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-17 06:58:24 pm
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

describe('讀取審核資料列表', () => {
  const _ENDPOINT = '/main/app/api/v1/reviewForms';
  let agent;

  const statusData1 = {
    _id: new ObjectId(),
    clientDomain: 'CACDI',
    companyId: new ObjectId(testFormResultData[0].companyId),
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
    submittedAt: new Date('2021/10/15'),
    valid: true,
    __vn: 0,
    __cc: '',
    __sc: 'Sidea',
  }
  const statusData2 = {
    _id: new ObjectId(),
    clientDomain: 'CACDI',
    companyId: new ObjectId(testFormResultData[0].companyId),
    fid: new ObjectId(),
    category: 'generalAffairs',
    type: 'type2',
    reviewRoles: [],
    reviewers: [new ObjectId().toHexString(), new ObjectId().toHexString()],
    layerAt: 1,
    nowReviewRole: [],
    nowReviewer: null,
    status: 1,
    comment: '',
    lastReviewerName: '',
    content: 'content',
    fillerName: 'fillerName',
    submittedAt: new Date('2022/01/31'),
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
    statusData1.nowReviewer = statusData1.reviewers[statusData1.layerAt];
    statusData2.nowReviewer = statusData2.reviewers[statusData2.layerAt];
    const statusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
    await statusCol.insertMany([statusData1, statusData2]);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });


  describe('需求欄位檢查', () => {
    test('[400:10019] 開始日期空白', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .send({ e: '2021/10/31', c: 'evaluation' })
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10019,
        message: '開始日期空白',
        result: null,
      });
      done();
    });
    test('[400:10020] 結束日期空白', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({ f: '2020/10/01', c: 'evaluation' })
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10020,
        message: '結束日期空白',
        result: null,
      });
      done();
    });
    test('[400:20009] 開始日期格式有誤', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({ f: 'test', e: '2021/10/31', c: 'evaluation' })
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20009,
        message: '開始日期格式有誤',
        result: null,
      });
      done();
    });
    test('[400:20010] 結束日期格式有誤', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({ f: '2020/10/01', e: 'test', c: 'evaluation' })
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20010,
        message: '結束日期格式有誤',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test("[200] 讀取審核資料列表-成功", async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({ f: '2020/10/01', e: '2021/10/31', c: 'generalAffairs' })
        .set(conf.REGISTER.KEY, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(1);
      expect(res.body.result[0].sid).toBe(statusData1._id.toString());
      expect(res.body.result[0].fid).toBe(statusData1.fid.toString());
      expect(res.body.result[0].category).toBe(statusData1.category);
      expect(res.body.result[0].type).toEqual(statusData1.type);
      expect(res.body.result[0].status).toEqual(statusData1.status);
      expect(res.body.result[0].comment).toEqual(statusData1.comment);
      expect(res.body.result[0].lastReviewerName).toBe(statusData1.lastReviewerName);
      expect(res.body.result[0].vn).toBe(statusData1.__vn);
      done();
    });
  });
});