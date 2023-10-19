/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-company-institution-setting-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-02-25 09:40:59 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('更新公司服務設定', () => {
  const _ENDPOINT = '/main/app/api/v1/companies';
  let agent;
  let loginData;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    loginData = await Base.login(agent);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位檢查', () => {
    const data = testCompanyData.data[0].institutionSetting;
    test('[400:11103] 閒置時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.idealTime.limitMinutes = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11103,
        message: '閒置時間空白',
        result: null,
      });
      done();
    });
    test('[400:11104] 自動登出時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.idealTime.alertMinute = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11104,
        message: '自動登出時間空白',
        result: null,
      });
      done();
    });
    test('[400:11105] HC排班規則起始時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.HCShiftScheduleRules.startTime = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11105,
        message: '排班規則起始時間空白',
        result: null,
      });
      done();
    });
    test('[400:11106] HC排班規則結束時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.HCShiftScheduleRules.endTime = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11106,
        message: '排班規則結束時間空白',
        result: null,
      });
      done();
    });
    test('[400:11112] HC排班最小間隔時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.HCShiftScheduleRules.minInternal = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11112,
        message: '排班最小間隔時間空白',
        result: null,
      });
      done();
    });
    test('[400:11107] HC中央服務紀錄報表的切割模式空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.HCCentralServiceReport.splitType = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11107,
        message: '中央服務紀錄報表的切割模式空白',
        result: null,
      });
      done();
    });
    test('[400:11107] DC中央服務紀錄報表的切割模式空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCCentralServiceReport.splitType = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11107,
        message: '中央服務紀錄報表的切割模式空白',
        result: null,
      });
      done();
    });
    test('[400:11108] HC中央服務紀錄報表的起訖空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.HCCentralServiceReport.timeType = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11108,
        message: '中央服務紀錄報表的起訖空白',
        result: null,
      });
      done();
    });
    test('[400:11109] HC個案收費單版本設定空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.HCCaseBill.version = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11109,
        message: '個案收費單版本設定空白',
        result: null,
      });
      done();
    });
    test('[400:11109] DC個案收費單版本設定空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCCaseBill.version = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11109,
        message: '個案收費單版本設定空白',
        result: null,
      });
      done();
    });
    test('[400:11110] HC個案收費單項目時段顯示設定空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.HCCaseBill.itemTimePeriodView = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11110,
        message: '個案收費單項目時段顯示設定空白',
        result: null,
      });
      done();
    });
    test('[400:11111] DC 全日服務起始時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.fullDayStartTime = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11111,
        message: '服務時間空白',
        result: null,
      });
      done();
    });
    test('[400:11111] DC 全日服務結束時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.fullDayEndTime = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11111,
        message: '服務時間空白',
        result: null,
      });
      done();
    });
    test('[400:11111] DC 上半日服務起始時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.beforeNoonStartTime = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11111,
        message: '服務時間空白',
        result: null,
      });
      done();
    });
    test('[400:11111] DC 上半日服務結束時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.beforeNoonEndTime = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11111,
        message: '服務時間空白',
        result: null,
      });
      done();
    });
    test('[400:11111] DC 下半日服務起始時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.afterNoonStartTime = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11111,
        message: '服務時間空白',
        result: null,
      });
      done();
    });
    test('[400:11111] DC 下半日服務結束時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.afterNoonEndTime = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11111,
        message: '服務時間空白',
        result: null,
      });
      done();
    });
    test('[400:11111] DC 社區式晚餐起始時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.communityDinnerStartTime = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11111,
        message: '服務時間空白',
        result: null,
      });
      done();
    });
    test('[400:11111] DC 社區式晚餐結束時間空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.communityDinnerEndTime = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11111,
        message: '服務時間空白',
        result: null,
      });
      done();
    });
    test('[400:11113] RC 禁止護理排班休息時數空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.RCShiftScheduleRules.forbiddenLessHours = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11113,
        message: '禁止排班休息時數空白',
        result: null,
      });
      done();
    });
    test('[400:11114] RC 警告護理排班休息大於時數空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.RCShiftScheduleRules.warningOverHours = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11114,
        message: '警告排班休息大於時數空白',
        result: null,
      });
      done();
    });
    test('[400:11115] RC 警告護理排班休息小於時數空白', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.RCShiftScheduleRules.warningLessHours = null;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 11115,
        message: '警告排班休息小於時數空白',
        result: null,
      });
      done();
    });
    test('[400:21101] 閒置時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.idealTime.limitMinutes = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21101,
        message: '閒置時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21102] 自動登出時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.idealTime.alertMinute = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21102,
        message: '自動登出時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21118] HC 排班規則起始時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.HCShiftScheduleRules.startTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21118,
        message: '排班規則起始時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21119] HC 排班規則結束時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.HCShiftScheduleRules.endTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21119,
        message: '排班規則結束時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21120] HC 排班最小間隔時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.HCShiftScheduleRules.minInternal = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21120,
        message: '排班最小間隔時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21103] HC 中央服務紀錄報表的切割模式資料有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.HCCentralServiceReport.splitType = 100;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21103,
        message: '中央服務紀錄報表的切割模式資料有誤',
        result: null,
      });
      done();
    });
    test('[400:21103] DC 中央服務紀錄報表的切割模式資料有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCCentralServiceReport.splitType = 100;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21103,
        message: '中央服務紀錄報表的切割模式資料有誤',
        result: null,
      });
      done();
    });
    test('[400:21104] HC 中央服務紀錄報表的起訖資料有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.HCCentralServiceReport.timeType = 100;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21104,
        message: '中央服務紀錄報表的起訖資料有誤',
        result: null,
      });
      done();
    });
    test('[400:21105] HC 個案收費單版本設定資料有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.HCCaseBill.version = 100;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21105,
        message: '個案收費單版本設定資料有誤',
        result: null,
      });
      done();
    });
    test('[400:21105] DC 個案收費單版本設定資料有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCCaseBill.version = 100;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21105,
        message: '個案收費單版本設定資料有誤',
        result: null,
      });
      done();
    });
    test('[400:21106] HC 個案收費單項目時段顯示設定資料有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.HCCaseBill.itemTimePeriodView = 100;
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21106,
        message: '個案收費單項目時段顯示設定資料有誤',
        result: null,
      });
      done();
    });
    test('[400:21112] DC 全日服務起始時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.fullDayStartTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21112,
        message: '服務時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21112] DC 全日服務結束時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.fullDayEndTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21112,
        message: '服務時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21112] DC 上半日服務起始時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.beforeNoonStartTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21112,
        message: '服務時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21112] DC 上半日服務結束時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.beforeNoonEndTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21112,
        message: '服務時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21112] DC 下半日服務起始時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.afterNoonStartTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21112,
        message: '服務時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21112] DC 下半日服務結束時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.afterNoonEndTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21112,
        message: '服務時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21112] DC 社區式晚餐起始時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.communityDinnerStartTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21112,
        message: '服務時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21112] DC 社區式晚餐結束時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.communityDinnerEndTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21112,
        message: '服務時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21115] RC 禁止護理排班休息時數格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.RCShiftScheduleRules.forbiddenLessHours = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21115,
        message: '禁止排班休息時數格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21116] RC 警告護理排班休息大於時數格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.RCShiftScheduleRules.warningOverHours = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21116,
        message: '警告排班休息大於時數格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21117] RC 警告護理排班休息小於時數格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.RCShiftScheduleRules.warningLessHours = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21117,
        message: '警告排班休息小於時數格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21107] DC 自動報到設定-交通車抵達日照中心時，格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCAutoPunch.onShuttleArrived = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21107,
        message: '自動報到設定-交通車抵達日照中心時，格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21108] DC 自動報到設定-進行生理量錯時，格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCAutoPunch.onTempMeasured = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21108,
        message: '自動報到設定-進行生理量錯時，格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21109] DC 自動報到設定-使用預設排班時間完成交通車報到，格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCAutoPunch.useShiftScheduleTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21109,
        message: '自動報到設定-使用預設排班時間完成交通車報到，格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21110] DC 自動報到設定-自動連動BB碼與交通車起迄時間，格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCAutoPunch.linkingUpBBCodeTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21110,
        message: '自動報到設定-自動連動BB碼與交通車起迄時間，格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21111] DC 服務時間設定-以排班B碼區分交通車上下午班次，格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.shiftScheduleBCode = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21111,
        message: '服務時間設定-以排班B碼區分交通車上下午班次，格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21113] 全日服務交通時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.fullDayShuttleTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21113,
        message: '服務交通時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21113] DC 上半日服務交通時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.beforeNoonShuttleTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21113,
        message: '服務交通時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21113] DC 下半日服務交通時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.afterNoonShuttleTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21113,
        message: '服務交通時間格式有誤',
        result: null,
      });
      done();
    });
    test('[400:21114] DC 社區式協助沐浴時間格式有誤', async (done) => {
      const _data = lodash.cloneDeep(data);
      _data.DCServiceTime.communityAssistBathTime = 'test';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21114,
        message: '協助沐浴時間格式有誤',
        result: null,
      });
      done();
    });
  });

  describe('資料規則驗證', () => {
    const data = testCompanyData.data[0].institutionSetting;
    test('[404:90008] 公司Id不存在', async (done) => {
      const _data = { ...data };
      _data.idealTime = {
        limitMinutes: 300,
        alertMinute: 1
      };
      const res = await agent
        .patch(`${_ENDPOINT}/0000x0000x0000/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
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

    test('[400:90010] 資料版號有誤(低於現有版本)', async (done) => {
      const _data = { ...data };
      _data.idealTime = {
        limitMinutes: 300,
        alertMinute: 1
      };
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: -1,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 90010,
        message: 'Data vn fail',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    const data = testCompanyData.data[0].institutionSetting;
    test('[200] 更新公司服務設定-成功', async (done) => {
      const _data = { ...data };
      _data.employeeCategory = ['打工1', '打工2', '櫃檯'];
      _data.advancedSalary = {
        mthEEOfficialRankName1: "test1",
        mthEEOfficialRankName2: "test2"
      };
      _data.caseReceipt = {
        customText1: "abc",
        customText2: "efg",
        serialNumber: 100,
      }
      _data.idealTime = {
        limitMinutes: 300,
        alertMinute: 1
      };
      _data.punchTime.punchIn = '07:30';
      const res = await agent
        .patch(`${_ENDPOINT}/${testCompanyData.data[0]._id}/institutionSetting`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: testCompanyData.data[0].__vn,
          sc: 'Erpv3',
          companyId: testCompanyData.data[0]._id,
        });

      const companyCol = NativeDBClient.getCollection(modelCodes.COMPANY);
      const companyData = await companyCol.findOne({ _id: testCompanyData.data[0]._id });
      const institutionData = companyData.institutionSetting;
      expect(res.status).toBe(200);
      expect(_data.employeeCategory).toEqual(institutionData.employeeCategory);
      expect(_data.advancedSalary).toEqual(institutionData.advancedSalary);
      expect(_data.HCShiftScheduleRules).toEqual(institutionData.HCShiftScheduleRules);
      expect(_data.RCShiftScheduleRules).toEqual(institutionData.RCShiftScheduleRules);
      expect(_data.DCAutoPunch).toEqual(institutionData.DCAutoPunch);
      expect(_data.DCServiceTime).toEqual(institutionData.DCServiceTime);
      expect(_data.HCCentralServiceReport).toEqual(institutionData.HCCentralServiceReport);
      expect(_data.DCCentralServiceReport).toEqual(institutionData.DCCentralServiceReport);
      expect(_data.HCCaseBill).toEqual(institutionData.HCCaseBill);
      expect(_data.DCCaseBill).toEqual(institutionData.DCCaseBill);
      expect(_data.caseReceipt).toEqual(institutionData.caseReceipt);
      expect(_data.idealTime).toEqual(institutionData.idealTime);
      expect(_data.punchTime.punchIn).toEqual(institutionData.punchTime.punchIn);
      expect(companyData.__cc).toBe(res.body.traceId);
      expect(companyData.__vn).toBe(testCompanyData.data[0].__vn+1);
      expect(companyData.__sc).toBe('Erpv3');
      done();
    });
  });
})
