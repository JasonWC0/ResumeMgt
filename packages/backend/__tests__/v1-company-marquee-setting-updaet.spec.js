/**
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-跑馬燈設定
 * Accountable: JoyceS Hsu, Wilbert Yang
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-company-marquee-setting-updaet.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-09-13 04:42:37 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('更新公司跑馬燈資料', () => {
  const method = 'PATCH';
  const _ENDPOINT = '/main/app/api/v1/companies';
  let agent;
  let headers;

  const obj = {
    speed: '200',
    contents: [
      {
        title: '線上教育',
        link: '',
        style: {
          fontColor: '#OOOO',
          hoverColor: '#FFFF',
          flash: false,
        },
      }
    ],
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
      vn: 0,
      sc: 'Erpv3',
      companyId: testCompanyData[0]._id,
    }

    const col = NativeDBClient.getCollection(modelCodes.MARQUEESETTING);
    const data = {
      companyId: ObjectId(testCompanyData[0]._id),
      speed: '100',
      contents: [
        {
          title: '線上教育',
          link: '',
          style: {
            fontColor: '#FFFF',
            hoverColor: '#FFFF',
            flash: true,
          },
        }
      ],
      valid: true,
      __cc: '',
      __vn: 0,
      __sc: '',
    }
    await col.insertOne(data);

    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位檢查', () => {
    test('[404:90008] 公司Id不存在', async (done) => {
      const res = await Base.callAPI(agent, method, `${_ENDPOINT}/0000x0000x0000/marqueeSetting`, headers, obj);

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
    test('[200] 更新公司跑馬燈資料-成功', async (done) => {
      const res = await Base.callAPI(agent, method, `${_ENDPOINT}/${testCompanyData[0]._id}/marqueeSetting`, headers, obj);

      const marqueeSettingCol = NativeDBClient.getCollection(modelCodes.MARQUEESETTING);
      const marqueeSettingData = await marqueeSettingCol.findOne({ companyId: ObjectId(testCompanyData[0]._id) });

      expect(res.status).toBe(200);
      expect(marqueeSettingData.speed).toBe(obj.speed);
      expect(marqueeSettingData.contents).toEqual(obj.contents);
      done();
    });
  });
})
 

