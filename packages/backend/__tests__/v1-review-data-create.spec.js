/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-review-data-create.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-17 05:10:01 pm
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

describe('建立審核資料', () => {
  const _ENDPOINT = '/main/app/api/v1/reviewForms';
  let agent;
  const data = {
    companyId: new ObjectId().toHexString(),
    formReviewType: 1,
    reviewers: [new ObjectId().toHexString()],
    fid: new ObjectId().toHexString(),
    category: 'generalAffairs',
    type: 'type',
    fillerName: 'fillerName',
    submitter: {
      personId: new ObjectId().toHexString(),
      name: 'submitterName',
    },
    content: 'content',
    submittedAt: new Date(),
  }

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:10503] 表單範本審核類別空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.formReviewType = '';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set(conf.REGISTER.KEY, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
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
    test('[400:11102] 公司Id空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.companyId = '';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11102,
        message: '公司ID空白',
        result: null,
      });
      done();
    });
    test('[400:10513] 表單結果Id空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.fid = '';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
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
    test('[400:10506] 主類別空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.category = '';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
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
    test('[400:10507] 次類別空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.type = '';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
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
    test('[400:10510] 填寫人姓名空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.fillerName = '';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
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
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
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
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
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
    test('[400:10518] 審核表單內容(標題)空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.content = '';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10518,
        message: '審核表單內容(標題)空白',
        result: null,
      });
      done();
    });
    test('[400:10519] 填表送單時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.submittedAt = '';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10519,
        message: '填表送單時間空白',
        result: null,
      });
      done();
    });
    test('[400:10517] 審核角色列表及審核人員Id列表皆空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.reviewers = [];
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
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
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
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
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
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
    test('[400:20512] 填表送單時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.submittedAt = 'test';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set(`${conf.REGISTER.KEY}`, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20512,
        message: '填表送單時間格式有誤',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test("[200] 建立審核資料-成功", async (done) => {
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(data)
        .set(conf.REGISTER.KEY, `Basic ${conf.REGISTER.CLIENTS[0].CLIENT_SECRET}`)
        .set({
          vn: 0,
          sc: 'Sidea',
          companyId: testFormResultData[0].companyId,
        });

      const statusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const statusRes = await statusCol.findOne({ fid: ObjectId(data.fid) });
      const historyCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
      const histRes = await historyCol.findOne({ fid: ObjectId(data.fid) });

      expect(res.status).toBe(200);
      expect(res.body.result.sid).toBe(statusRes._id.toString());
      expect(statusRes.companyId.toString()).toBe(data.companyId);
      expect(statusRes.reviewers).toEqual(data.reviewers);
      expect(statusRes.category).toBe(data.category);
      expect(statusRes.type).toBe(data.type);
      expect(statusRes.fillerName).toBe(data.fillerName);
      expect(statusRes.content).toBe(data.content);
      expect(statusRes.submittedAt.toISOString()).toBe(data.submittedAt.toISOString());
      expect(statusRes.clientDomain).toBe('CACDI');
      expect(statusRes.__cc).toBe(res.body.traceId);
      expect(statusRes.__sc).toBe('Sidea');
      expect(statusRes.__vn).toBe(0);
      expect(statusRes.status).toBe(1);
      expect(statusRes.layerAt).toBe(0);
      expect(statusRes.nowReviewer.toString()).toBe(data.reviewers[0]);
      expect(histRes.companyId.toString()).toBe(data.companyId);
      expect(histRes.category).toBe(data.category);
      expect(histRes.type).toBe(data.type);
      expect(histRes.fillerName).toBe(data.fillerName);
      expect(histRes.submitter.personId.toString()).toBe(data.submitter.personId);
      expect(histRes.submitter.name).toBe(data.submitter.name);
      expect(histRes.submittedAt.toISOString()).toBe(data.submittedAt.toISOString());
      expect(histRes.clientDomain).toBe('CACDI');
      expect(histRes.__cc).toBe(res.body.traceId);
      expect(histRes.__sc).toBe('Sidea');
      expect(histRes.__vn).toBe(0);
      expect(histRes.status).toBe(1);
      done();
    });
  });
});