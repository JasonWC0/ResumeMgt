/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-review-data-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-17 05:57:50 pm
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

describe('編輯審核資料', () => {
  const _ENDPOINT = '/main/app/api/v1/reviewForms';
  let agent;
  let id;
  let fid;

  const data = {
    formReviewType: 1,
    reviewers: [new ObjectId().toHexString()],
    fillerName: 'newFillerName',
    submitter: {
      personId: new ObjectId().toHexString(),
      name: 'submitterName',
    },
  }

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
      reviewers: [new ObjectId().toHexString()],
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
    fid = statusData.fid.toString();
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
        .patch(`${_ENDPOINT}/oooxxxoooxxxoooxxx`)
        .send(data)
        .set(conf.REGISTER.KEY, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          vn: 0,
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
    test('[400:10503] 表單範本審核類別空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.formReviewType = '';
      const res = await agent
        .patch(`${_ENDPOINT}/${id}`)
        .send(_data)
        .set(conf.REGISTER.KEY, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          vn: 0,
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10503,
        message: '表單範本審核類別空白',
        result: null,
      });
      done();
    });
    test('[400:10510] 填寫人姓名空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.fillerName = '';
      const res = await agent
        .patch(`${_ENDPOINT}/${id}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          vn: 0,
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10510,
        message: '填寫人姓名空白',
        result: null,
      });
      done();
    });
    test('[400:10515] 送單者人員Id空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.submitter.personId = '';
      const res = await agent
        .patch(`${_ENDPOINT}/${id}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          vn: 0,
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10515,
        message: '送單者人員Id空白',
        result: null,
      });
      done();
    });
    test('[400:10516] 送單者姓名空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.submitter.name = '';
      const res = await agent
        .patch(`${_ENDPOINT}/${id}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          vn: 0,
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10516,
        message: '送單者姓名空白',
        result: null,
      });
      done();
    });
    test('[400:10517] 審核角色列表及審核人員Id列表皆空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.reviewers = [];
      const res = await agent
        .patch(`${_ENDPOINT}/${id}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          vn: 0,
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10517,
        message: '審核角色列表及審核人員Id列表皆空白',
        result: null,
      });
      done();
    });
    test('[400:20502] 表單範本審核類別格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.formReviewType = 9999;
      const res = await agent
        .patch(`${_ENDPOINT}/${id}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          vn: 0,
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20502,
        message: '表單範本審核類別格式有誤',
        result: null,
      });
      done();
    });
    test('[400:20511] 審核角色列表格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      delete _data.reviewers
      _data.reviewRoles = [0];
      const res = await agent
        .patch(`${_ENDPOINT}/${id}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          vn: 0,
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20511,
        message: '審核角色列表格式有誤',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test("[200] 編輯審核資料-成功", async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/${id}`)
        .send(data)
        .set(conf.REGISTER.KEY, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          vn: 0,
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      const statusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const statusRes = await statusCol.findOne({ _id: ObjectId(id) });
      const historyCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
      const histResList = await historyCol.find({ fid: ObjectId(fid) }).toArray();

      expect(res.status).toBe(200);
      expect(statusRes.reviewers).toEqual(data.reviewers);
      expect(statusRes.fillerName).toBe(data.fillerName);
      expect(statusRes.__cc).toBe(res.body.traceId);
      expect(statusRes.__sc).toBe('Sidea');
      expect(statusRes.__vn).toBe(1);
      expect(statusRes.status).toBe(1);
      expect(statusRes.layerAt).toBe(0);
      expect(statusRes.nowReviewer.toString()).toBe(data.reviewers[0]);
      for (const histRes of histResList) {
        if (histRes.__cc === res.body.traceId) {
          expect(histRes.fillerName).toBe(data.fillerName);
          expect(histRes.submitter.personId.toString()).toBe(data.submitter.personId);
          expect(histRes.submitter.name).toBe(data.submitter.name);
        }
      }
      done();
    });
  });
});