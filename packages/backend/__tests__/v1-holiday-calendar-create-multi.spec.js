/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-holiday-calendar-create-multi.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-07-25 02:42:50 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const moment = require('moment');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('批次新增假日行事曆', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/calendars/holiday/multi';
  let agent;
  let headers;

  const data1 = {
    companyId: testCompanyData[0]._id,
    startDate: '2022/07/01',
    endDate: '2022/07/15',
    dayOfTheWeek: 4,
    type: 2,
    note: '休假日',
    overWrite: false,
  };

  const data2 = {
    companyId: testCompanyData[0]._id,
    startDate: '2022/07/16',
    endDate: '2022/07/31',
    dayOfTheWeek: 6,
    type: 1,
    note: '例假日',
    overWrite: true,
  }

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
      vn: -1,
      sc: 'Erpv3',
      companyId: testCompanyData[0]._id,
    };

    const calendarCol = NativeDBClient.getCollection(modelCodes.CALENDAR);
    const _data = [{
      companyId: new ObjectId(testCompanyData[0]._id),
      date: new Date('2022/07/14'),
      type: 0,
      note: '上班日',
      valid: true,
      __vn: 0,
    }, {
      companyId: new ObjectId(testCompanyData[0]._id),
      date: new Date('2022/07/16'),
      type: 0,
      note: '上班日',
      valid: true,
      __vn: 0,
    }];
    await calendarCol.insert(_data);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位檢查', () => {
    test('[400:11102] 公司ID空白', async (done) => {
      const _data = lodash.cloneDeep(data1);
      _data.companyId = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 11102, '公司ID空白');
      done();
    });
    test('[400:10019] 開始日期空白', async (done) => {
      const _data = lodash.cloneDeep(data1);
      _data.startDate = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 10019, '開始日期空白');
      done();
    });
    test('[400:10020] 結束日期空白', async (done) => {
      const _data = lodash.cloneDeep(data1);
      _data.endDate = '';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 10020, '結束日期空白');
      done();
    });
    test('[400:21139] 星期幾不存在 (0~6)', async (done) => {
      const _data = lodash.cloneDeep(data1);
      _data.dayOfTheWeek = 9999;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21139, '星期幾不存在');
      done();
    });
    test('[400:21136] 假日類別分類有誤 (type=0~2)', async (done) => {
      const _data = lodash.cloneDeep(data1);
      _data.type = 9999;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21136, '假日類別分類有誤');
      done();
    });
    test('[400:21135] 國定假日不可新刪修 (type=3)', async (done) => {
      const _data = lodash.cloneDeep(data1);
      _data.type = 3;
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21135, '國定假日不可新刪修');
      done();
    });
    test('[400:20009] 開始日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data1);
      _data.startDate = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 20009, '開始日期格式有誤');
      done();
    });
    test('[400:20010] 結束日期格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data1);
      _data.endDate = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 20010, '結束日期格式有誤');
      done();
    });
    test('[400:21140] 是否覆蓋假日行事曆格式有誤(boolean)', async (done) => {
      const _data = lodash.cloneDeep(data1);
      _data.overWrite = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21140, '是否覆蓋假日行事曆格式有誤');
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21121] 公司不存在', async (done) => {
      const _data = lodash.cloneDeep(data1);
      _data.companyId = 'test';
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, _data);
      Base.verifyError(res, 21121, '公司不存在');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 批次新增假日行事曆-不複寫-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data1);

      const calendarCol = NativeDBClient.getCollection(modelCodes.CALENDAR);
      const calendarMonthRes = await calendarCol.find({
        valid: true,
        companyId: new ObjectId(data1.companyId),
        date: {
          $gte: moment().set({'year': 2022, 'month': 6}).startOf('month').toDate(),
          $lt: moment().set({'year': 2022, 'month': 6}).endOf('month').toDate()
        }
      }).toArray();
      const _714Res= await calendarCol.findOne({ valid: true, companyId: new ObjectId(data1.companyId), date: new Date('2022/07/14') });

      expect(res.status).toBe(200);
      expect(calendarMonthRes).toHaveLength(3);
      expect(_714Res.type).toBe(0);
      done();
    });
    test('[200] 批次新增假日行事曆-複寫-成功', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data2);

      const calendarCol = NativeDBClient.getCollection(modelCodes.CALENDAR);
      const calendarMonthRes = await calendarCol.find({
        valid: true,
        companyId: new ObjectId(data1.companyId),
        date: {
          $gte: moment().set({'year': 2022, 'month': 6}).startOf('month').toDate(),
          $lt: moment().set({'year': 2022, 'month': 6}).endOf('month').toDate()
        }
      }).toArray();
      const _716Res= await calendarCol.findOne({ valid: true, companyId: new ObjectId(data1.companyId), date: new Date('2022/07/16') });

      expect(res.status).toBe(200);
      expect(calendarMonthRes).toHaveLength(5);
      expect(_716Res.type).toBe(1);
      done();
    });
  });
});

