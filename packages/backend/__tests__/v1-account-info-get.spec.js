/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-account-info-get.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-03-31 01:36:52 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const NativeDBClient = require('./basic/native-db-client');
const modelCodes = require('./enums/model-codes');
const testAccountData = require('./seeder/data/account.json').data;
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('取得帳號資料', () => {
  const _ENDPOINT = '/main/app/api/v1/accountInfo';
  let agent;
  let loginData;
  let marqueeData;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    const col = NativeDBClient.getCollection(modelCodes.MARQUEESETTING);
    marqueeData = {
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
    };
    await col.insertOne(marqueeData);

    agent = request.agent(new App().app);
    loginData = await Base.login(agent);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('成功', () => {
    test('[200] 取得帳號資料-成功', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set('Authorization', `Bearer ${loginData.token}`);

      const accountCol = NativeDBClient.getCollection(modelCodes.ACCOUNT);
      const accountRes = await accountCol.findOne({ account: testAccountData[0].account });

      expect(res.status).toBe(200);
      expect(res.body.result.name).toBe('管理員');
      expect(res.body.result.personId).toBe(testAccountData[0].personId.toString());
      expect(res.body.result.corpId).toBe(testAccountData[0].corpId)
      expect(res.body.result.accountId).toBe(accountRes._id.toString());
      expect(res.body.result.account.toLowerCase()).toBe(testAccountData[0].account.toLowerCase());
      expect(Object.keys(res.body.result.companies).length).toBe(2);
      expect(res.body.result.companies[testCompanyData[0]._id].importERPv3).toBe(testCompanyData[0].importERPv3);
      expect(res.body.result.companies[testCompanyData[0]._id].marqueeSetting.speed).toBe(marqueeData.speed);
      expect(res.body.result.companies[testCompanyData[0]._id].marqueeSetting.contents).toEqual(marqueeData.contents);
      done();
    });
  });
});
