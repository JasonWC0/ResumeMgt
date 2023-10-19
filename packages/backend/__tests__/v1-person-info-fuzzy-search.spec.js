/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-company-info-update.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-02-16 11:42:43 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const NativeDBClient = require('./basic/native-db-client');
const createData = require('./seeder/data/person.json');
const Base = require('./basic/basic');
const App = require('../app');
const corpData = require('./seeder/data/corporation.json');
const _ = require('lodash');

describe('模糊搜尋人員', () => {
  const _ENDPOINT = '/main/app/api/v1/persons/c/fs';
  let agent;
  let loginData;
  let personData = _.cloneDeep(createData.data[0]);
  const persons = _.cloneDeep(createData.data);

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
    test('[400:10000] 總公司ID空白', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({ name : personData.name })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10000,
        message: '總公司ID空白',
        result: null,
      });
      done();
    });

    test('[400:10100] 姓名空白', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .query({ corpId : corpData.data[0].id })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10100,
        message: '姓名空白',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[200] 模糊搜尋人員-成功', async (done) => {
      const res = await agent.get(`${_ENDPOINT}`)
        .query({ 
          corpId: corpData.data[0]._id.toString(),
          name: '錢'
        })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(2);
      const names = res.body.result.map((p) => p.name);
      expect(res.body.result[0].vn).toBe(0);
      expect(res.body.result[1].vn).toBe(0);
      expect(names.includes(persons[1].name)).toBeTruthy();
      expect(names.includes(persons[3].name)).toBeTruthy();
      done();
    });
  });
})
