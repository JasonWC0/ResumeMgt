/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-case-status-history-create.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-10-05 04:52:14 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const moment = require('moment');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const { LunaServiceClient, SideAServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testCaseData = require('./seeder/data/case.json').data;
const Base = require('./basic/basic');
const App = require('../app');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
jest.mock('@erpv3/app-common/shared/connection-clients/default-luna-service-client');
jest.mock('@erpv3/app-common/shared/connection-clients/default-sidea-service-client');

describe('建立個案狀態', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/caseStatusHistories';
  let agent;
  let headers;
  const _caseId1 = new ObjectId(testCaseData[0]._id);
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

  describe('需求欄位檢查', () => {
    const createClosedObj = {
      caseId: _caseId1.toString(),
      service: 'DC',
      status: 3,
      startDate: '2022/10/30',
      memo: '最新服務日期',
      reason: 0,
    }
    const createPendingObj = {
      caseId: _caseId1.toString(),
      service: 'DC',
      status: 2,
      startDate: '2022/10/30',
      memo: '最新服務日期',
      changeSchedule: 0,
    }
    test('[400:10010] 個案Id空白', async (done) => {
      const _data = lodash.cloneDeep(createClosedObj);
      _data.caseId = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10010, '個案Id空白');
      done();
    });
    test('[400:10021] 服務類型空白', async (done) => {
      const _data = lodash.cloneDeep(createClosedObj);
      _data.service = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10021, '服務類型空白');
      done();
    });
    test('[400:20025] 服務類型資料有誤', async (done) => {
      const _data = lodash.cloneDeep(createClosedObj);
      _data.service = 'TEST';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20025, '服務類型資料有誤');
      done();
    });
    test('[400:10019] 開始日期空白', async (done) => {
      const _data = lodash.cloneDeep(createClosedObj);
      _data.startDate = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10019, '開始日期空白');
      done();
    });
    test('[400:20009] 開始日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(createClosedObj);
      _data.startDate = 'TEST';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20009, '開始日期格式有誤');
      done();
    });
    test('[400:20010] 結束日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(createClosedObj);
      _data.endDate = 'TEST';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20010, '結束日期格式有誤');
      done();
    });
    test('[400:10304] 個案狀態空白', async (done) => {
      const _data = lodash.cloneDeep(createClosedObj);
      _data.status = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10304, '個案狀態空白');
      done();
    });
    test('[400:20300] 個案服務狀態不存在', async (done) => {
      const _data = lodash.cloneDeep(createClosedObj);
      _data.status = 9999;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20300, '個案服務狀態不存在');
      done();
    });
    test('[400:10305] 個案結案原因空白', async (done) => {
      const _data = lodash.cloneDeep(createClosedObj);
      _data.reason = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10305, '個案結案原因空白');
      done();
    });
    test('[400:20319] 個案結案理由資料有誤', async (done) => {
      const _data = lodash.cloneDeep(createClosedObj);
      _data.reason = 99999;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20319, '個案結案理由資料有誤');
      done();
    });
    test('[400:10306] 個案暫停排班變更類型空白', async (done) => {
      const _data = lodash.cloneDeep(createPendingObj);
      _data.changeSchedule = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10306, '個案暫停排班變更類型空白');
      done();
    });
    test('[400:20320] 個案暫停排班變更類型資料有誤', async (done) => {
      const _data = lodash.cloneDeep(createPendingObj);
      _data.changeSchedule = 99999;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20320, '個案暫停排班變更類型資料有誤');
      done();
    });
  });

  describe('資料規則驗證', () => {
    const createClosedObj = {
      caseId: _caseId1.toString(),
      service: 'DC',
      status: 3,
      startDate: '1999/10/30',
      memo: '最新服務日期',
      reason: 0,
    }
    test('[400:20322] 個案狀態紀錄日期不允許', async (done) => {
      const _data = lodash.cloneDeep(createClosedObj);

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 20322, '個案狀態紀錄日期不允許');
      done();
    });
  });

  describe('成功', () => {
    const { LunaServiceClass } = LunaServiceClient;
    const { SideAServiceClass } = SideAServiceClient;
    test('[200] 新增個案狀態(結案)-成功', async (done) => {
      LunaServiceClass.setFromWebAPI.mockResolvedValue({
        success: true,
      });
      SideAServiceClass.callNormalAPI.mockResolvedValue({
        result: [],
      });
      const createClosedObj = {
        caseId: _caseId1.toString(),
        service: 'RC',
        status: 3,
        startDate: '2022/10/30',
        memo: '最新服務日期',
        reason: 0,
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, createClosedObj);

      const careStatusHistCol = NativeDBClient.getCollection(modelCodes.CASESTATUSHISTORY);
      const careStatusRes = await careStatusHistCol.findOne({ caseId: _caseId1 });
      const caseCol = NativeDBClient.getCollection(modelCodes.CASE);
      const caseObj = await caseCol.findOne({ _id: _caseId1 });

      expect(res.status).toBe(200);
      expect(careStatusRes.rc).toHaveLength(3);
      expect(careStatusRes.rc[2].date).toEqual(moment(createClosedObj.startDate, 'YYYY/MM/DD').toDate());
      expect(careStatusRes.rc[2].memo).toEqual(createClosedObj.memo);
      expect(caseObj.rc.endDate).toEqual(moment(createClosedObj.startDate, 'YYYY/MM/DD').toDate());
      done();
    });
    test('[200] 新增個案狀態(暫停)-成功', async (done) => {
      LunaServiceClass.setFromWebAPI.mockResolvedValue({
        success: true,
      });
      SideAServiceClass.callNormalAPI.mockResolvedValue({
        result: [],
      });
      const createPendingObj = {
        caseId: _caseId1.toString(),
        service: 'DC',
        status: 2,
        startDate: '2022/10/30',
        endDate: '2022/11/30',
        memo: '最新服務日期',
        changeSchedule: 0,
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, createPendingObj);

      const careStatusHistCol = NativeDBClient.getCollection(modelCodes.CASESTATUSHISTORY);
      const careStatusRes = await careStatusHistCol.findOne({ caseId: _caseId1 });
      const caseCol = NativeDBClient.getCollection(modelCodes.CASE);
      const caseObj = await caseCol.findOne({ _id: _caseId1 });

      expect(res.status).toBe(200);
      expect(careStatusRes.dc).toHaveLength(4);
      expect(careStatusRes.dc[2].date).toEqual(moment(createPendingObj.startDate, 'YYYY/MM/DD').toDate());
      expect(careStatusRes.dc[2].memo).toEqual(createPendingObj.memo);
      expect(careStatusRes.dc[2].status).toEqual(2);
      expect(careStatusRes.dc[3].date).toEqual(moment(createPendingObj.endDate, 'YYYY/MM/DD').add(1,'days').toDate());
      expect(careStatusRes.dc[3].status).toEqual(0);
      expect(caseObj.dc.endDate).toEqual(null);
      done();
    });
  });
});
