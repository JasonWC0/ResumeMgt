/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-case-status-history-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-10-05 04:52:27 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const moment = require('moment');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testCaseData = require('./seeder/data/case.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('更新個案狀態', () => {
  const METHOD = 'PATCH';
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

  describe('需求欄位檢查', () => {
    const updateObj = {
      caseId: _caseId1.toString(),
      service: 'DC',
      date: '2022/10/30',
      memo: '更新最新服務日期',
      reason: 0,
    }
    test('[400:10010] 個案Id空白', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.caseId = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${objData[0].dc[1]._id.toString()}`, headers, _data);
      Base.verifyError(res, 10010, '個案Id空白');
      done();
    });
    test('[400:10021] 服務類型空白', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.service = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${objData[0].dc[1]._id.toString()}`, headers, _data);
      Base.verifyError(res, 10021, '服務類型空白');
      done();
    });
    test('[400:20025] 服務類型資料有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.service = 'TEST';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${objData[0].dc[1]._id.toString()}`, headers, _data);
      Base.verifyError(res, 20025, '服務類型資料有誤');
      done();
    });
    test('[400:10028] 日期空白', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.date = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${objData[0].dc[1]._id.toString()}`, headers, _data);
      Base.verifyError(res, 10028, '日期空白');
      done();
    });
    test('[400:20023] 日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.date = 'TEST';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${objData[0].dc[1]._id.toString()}`, headers, _data);
      Base.verifyError(res, 20023, '日期格式有誤');
      done();
    });
    test('[400:10305] 個案結案原因空白', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.date = '2020/01/01';
      _data.reason = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${objData[0].dc[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 10305, '個案結案原因空白');
      done();
    });
    test('[400:20319] 個案結案理由資料有誤', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.date = '2020/01/01';
      _data.reason = 99999;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${objData[0].dc[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 20319, '個案結案理由資料有誤');
      done();
    });
  });

  describe('資料規則驗證', () => {
    const updateObj = {
      caseId: _caseId1.toString(),
      service: 'DC',
      date: '2019/10/30',
      memo: '更新最新服務日期',
      reason: 0,
    }
    test('[400:20322] 個案狀態紀錄日期不允許', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.date = '2022/10/30';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${objData[0].dc[0]._id.toString()}`, headers, _data);
      Base.verifyError(res, 20322, '個案狀態紀錄日期不允許');
      done();
    });
    test('[400:20322] 個案狀態紀錄日期不允許', async (done) => {
      const _data = lodash.cloneDeep(updateObj);
      _data.date = '2018/01/01';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${objData[0].dc[1]._id.toString()}`, headers, _data);
      Base.verifyError(res, 20322, '個案狀態紀錄日期不允許');
      done();
    });
    test('[400:20321] 個案該筆狀態紀錄不存在', async (done) => {
      const _data = lodash.cloneDeep(updateObj);

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/xxxxxxxxxxxxxxxx`, headers, _data);
      Base.verifyError(res, 20321, '個案該筆狀態紀錄不存在');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 更新個案狀態-成功', async (done) => {
      const obj = {
        caseId: _caseId1.toString(),
        service: 'DC',
        date: '2022/10/30',
        memo: '更新最新服務日期',
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${objData[0].dc[1]._id.toString()}`, headers, obj);

      const careStatusHistCol = NativeDBClient.getCollection(modelCodes.CASESTATUSHISTORY);
      const careStatusRes = await careStatusHistCol.findOne({ caseId: _caseId1 });

      expect(res.status).toBe(200);
      expect(careStatusRes.dc[1].date).toEqual(moment(obj.date, 'YYYY/MM/DD').toDate());
      expect(careStatusRes.dc[1].memo).toEqual(obj.memo);
      done();
    });
    test('[200] 更新個案狀態-成功', async (done) => {
      const obj = {
        caseId: _caseId2.toString(),
        service: 'HC',
        date: '2022/10/30',
        reason: 2,
        memo: '更新最新結案'
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${objData[1].hc[1]._id.toString()}`, headers, obj);

      const careStatusHistCol = NativeDBClient.getCollection(modelCodes.CASESTATUSHISTORY);
      const careStatusRes = await careStatusHistCol.findOne({ caseId: _caseId2 });
      const caseCol = NativeDBClient.getCollection(modelCodes.CASE);
      const caseObj = await caseCol.findOne({ _id: _caseId2 });

      expect(res.status).toBe(200);
      expect(careStatusRes.hc[1].date).toEqual(moment(obj.date, 'YYYY/MM/DD').toDate());
      expect(careStatusRes.hc[1].memo).toEqual(obj.memo);
      expect(careStatusRes.hc[1].reason).toEqual(obj.reason);
      expect(caseObj.hc.endDate).toEqual(moment(obj.date, 'YYYY/MM/DD').toDate());
      done();
    });
    test('[200] 更新個案狀態-成功', async (done) => {
      const obj = {
        caseId: _caseId1.toString(),
        service: 'RC',
        date: '2020/04/01',
        memo: '更新過去服務日期',
        reason: 4,
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${objData[0].rc[0]._id.toString()}`, headers, obj);

      const careStatusHistCol = NativeDBClient.getCollection(modelCodes.CASESTATUSHISTORY);
      const careStatusRes = await careStatusHistCol.findOne({ caseId: _caseId1 });

      expect(res.status).toBe(200);
      expect(careStatusRes.rc[0].date).toEqual(moment(obj.date, 'YYYY/MM/DD').toDate());
      expect(careStatusRes.rc[0].memo).toEqual(obj.memo);
      expect(careStatusRes.rc[0].reason).toEqual(obj.reason);
      done();
    });
  });
});
