/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-case-status-history-delete.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-10-05 04:52:50 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testCaseData = require('./seeder/data/case.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('刪除個案狀態', () => {
  const METHOD = 'DELETE';
  const _ENDPOINT = '/main/app/api/v1/caseStatusHistories';
  let agent;
  let headers;
  const _caseId1 = new ObjectId(testCaseData[0]._id);
  const _caseId2 = new ObjectId(testCaseData[1]._id);
  const objData = [{
    caseId: _caseId1,
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
    rc: [{
      _id: new ObjectId(),
      date : new Date('2020-06-01'),
      status : 3,
      reason : 2,
      memo : 'test1',
      createdAt : new Date('2020-05-01 08:00:00'),
    }, {
      _id: new ObjectId(),
      date : new Date('2020-06-01'),
      status : 0,
      reason : null,
      memo : 'test2',
      createdAt : new Date('2020-05-01 20:00:00'),
    }],
    valid: true,
  }, {
    caseId: _caseId2,
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
    test('[200] 刪除個案狀態-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${objData[0].dc[1]._id.toString()}`, headers, {}, { caseId: _caseId1.toString(), service: 'DC' });

      const caseCol = NativeDBClient.getCollection(modelCodes.CASE);
      const caseObj = await caseCol.findOne({ _id: _caseId1 });
      const careStatusHistCol = NativeDBClient.getCollection(modelCodes.CASESTATUSHISTORY);
      const careStatusHistList = await careStatusHistCol.findOne({ caseId: _caseId1 });

      expect(res.status).toBe(200);
      expect(caseObj.dc.endDate).toEqual(objData[0].dc[0].date);
      expect(careStatusHistList.dc).toHaveLength(1);
      expect(careStatusHistList.dc[0].date).toEqual(objData[0].dc[0].date);
      done();
    });
    test('[200] 刪除個案狀態-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${objData[1].hc[1]._id.toString()}`, headers, {}, { caseId: _caseId2.toString(), service: 'HC' });

      const caseCol = NativeDBClient.getCollection(modelCodes.CASE);
      const caseObj = await caseCol.findOne({ _id: _caseId2 });
      const careStatusHistCol = NativeDBClient.getCollection(modelCodes.CASESTATUSHISTORY);
      const careStatusHistList = await careStatusHistCol.findOne({ caseId: _caseId2 });

      expect(res.status).toBe(200);
      expect(caseObj.hc.endDate).toEqual(null);
      expect(careStatusHistList.hc).toHaveLength(1);
      expect(careStatusHistList.hc[0].date).toEqual(objData[1].hc[0].date);
      done();
    });
    test('[200] 刪除個案狀態-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${objData[0].rc[1]._id.toString()}`, headers, {}, { caseId: _caseId1.toString(), service: 'RC' });

      const caseCol = NativeDBClient.getCollection(modelCodes.CASE);
      const caseObj = await caseCol.findOne({ _id: _caseId1 });
      const careStatusHistCol = NativeDBClient.getCollection(modelCodes.CASESTATUSHISTORY);
      const careStatusHistList = await careStatusHistCol.findOne({ caseId: _caseId1 });

      expect(res.status).toBe(200);
      expect(caseObj.rc.endDate).toEqual(objData[0].rc[0].date);
      expect(careStatusHistList.rc).toHaveLength(1);
      expect(careStatusHistList.rc[0].date).toEqual(objData[0].rc[0].date);
      done();
    });
  });
});
