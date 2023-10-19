/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-role-default-service-read-list.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-04-12 03:42:35 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const roleDefaultServiceData = require('./seeder/data/role-default-service.json').data;

describe('讀取系統預設服務類型的角色權限列表', () => {
  const _ENDPOINT = '/main/app/api/v1/roleDefaultServices';
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

  describe('成功', () => {
    beforeAll(async (done) => {
      const serviceGroupCol = NativeDBClient.getCollection(modelCodes.SERVICEGROUP);
      const serviceGroupRes = await serviceGroupCol.findOne({ code: 'ALL', valid: true });
      const serviceGroupId = serviceGroupRes._id;
      roleDefaultServiceData[0].serviceGroupId = serviceGroupId;
      roleDefaultServiceData[1].serviceGroupId = serviceGroupId;

      const roleDefaultServiceCol = NativeDBClient.getCollection(modelCodes.ROLEDEFAULTSERVICE);
      await roleDefaultServiceCol.insertMany(roleDefaultServiceData);
      done();
    });
    test('[200] 讀取系統預設服務類型的角色權限列表-成功', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(2);
      expect(res.body.result[0].vn).toBe(0);
      expect(res.body.result[1].vn).toBe(0);
      done();
    });
  });
})
