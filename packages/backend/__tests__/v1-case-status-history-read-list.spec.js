/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-case-status-history-read-list.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-10-05 04:53:09 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('讀取個案狀態列表', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/caseStatusHistories';
  let agent;
  let headers;
  const _id = new ObjectId();
  const objData = [{
    caseId: _id,
    hc: [{
      _id: new ObjectId(),
      date : new Date('2020-05-01'),
      status : 2,
      reason : null,
      memo : 'test1',
      createdAt : new Date('2020-04-15 16:00:00'),
    }, {
      _id: new ObjectId(),
      date : new Date('2020-06-10'),
      status : 3,
      reason : 0,
      memo : 'test1',
      createdAt : new Date('2020-05-15 08:00:00'),
    }],
    dc: [{
      _id: new ObjectId(),
      date : new Date('2020-08-01'),
      status : 3,
      reason : 2,
      memo : 'test1',
      createdAt : new Date('2020-07-15 16:00:00'),
    }, {
      _id: new ObjectId(),
      date : new Date('2020-09-01'),
      status : 0,
      reason : null,
      memo : 'test2',
      createdAt : new Date('2020-08-20 08:00:00'),
    }],
    rc: [],
    valid: true,
  }];

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    const loginData = await Base.login(agent);
    headers = {
      Authorization: `Bearer ${loginData.token}`,
      vn: 0,
      sc: 'Erpv3',
      companyId: testCompanyData[0]._id
    }

    const careStatusHistCol = NativeDBClient.getCollection(modelCodes.CASESTATUSHISTORY);
    await careStatusHistCol.insertMany(objData);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('成功', () => {
    test('[200] 讀取個案狀態列表-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { caseId: _id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.result.HC.length).toBe(2);
      expect(res.body.result.DC.length).toBe(2);
      expect(res.body.result.HC[0].status).toBe(objData[0].hc[1].status);
      expect(res.body.result.HC[0].reason).toBe(objData[0].hc[1].reason);
      expect(res.body.result.DC[0].status).toBe(objData[0].dc[1].status);
      done();
    });
    test('[200] 讀取個案狀態列表-成功(無紀錄)', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {}, { caseId: new ObjectId().toString() });

      expect(res.status).toBe(200);
      expect(res.body.result.HC.length).toBe(0);
      expect(res.body.result.DC.length).toBe(0);
      expect(res.body.result.RC.length).toBe(0);
      done();
    });
  });
});