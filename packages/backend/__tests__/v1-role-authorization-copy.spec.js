/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-role-authorization-copy.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-04-19 11:39:26 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('複製公司角色權限', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/roleAuthorizations/copy';
  let agent;
  let loginData;
  let headers;

  let id = '';
  let data1 = {};
  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    loginData = await Base.login(agent);
    headers = {
      Authorization: `Bearer ${loginData.token}`,
      vn: '',
      sc: 'Erpv3',
      companyId: 'testCompanyId'
    };

    const col = NativeDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
    data1 = {
      companyId: ObjectId(testCompanyData[0]._id),
      role: 0,
      name: '管理者',
      manageAuthLevel: 0,
      isDefault: true,
      pageAuth: {
        test: {
          index: 0
        },
      },
      reportAuth: {
        test: {
          index: 1,
        },
      },
      valid: true,
    }
    const data2 = { ...data1, role: 1000, name: '測試新角'}
    await col.insert([data1, data2]);
    const obj = await col.findOne({ companyId: data1.companyId, role: data1.role });
    id = obj._id.toString();
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:11102] 公司ID空白', async (done) => {
      const data = {
        companyId: '',
        roleAuthorizationId: id,
        name: '測試管理員',
        manageAuthLevel: 0,
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      Base.verifyError(res, 11102, '公司ID空白')
      done();
    });
    test('[400:11120] 角色權限Id空白', async (done) => {
      const data = {
        companyId: testCompanyData[0]._id,
        roleAuthorizationId: '',
        name: '測試管理員',
        manageAuthLevel: 0,
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      Base.verifyError(res, 11120, '角色權限Id空白')
      done();
    });
    test('[400:11118] 角色名稱空白', async (done) => {
      const data = {
        companyId: testCompanyData[0]._id,
        roleAuthorizationId: id,
        name: '',
        manageAuthLevel: 0,
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      Base.verifyError(res, 11118, '角色名稱空白')
      done();
    });
    test('[400:11119] 管理角色權限等級空白', async (done) => {
      const data = {
        companyId: testCompanyData[0]._id,
        roleAuthorizationId: id,
        name: '測試管理員',
        manageAuthLevel: '',
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      Base.verifyError(res, 11119, '管理角色權限等級空白');
      done();
    });
    test('[400:21125] 管理角色權限等級資料有誤', async (done) => {
      const data = {
        companyId: testCompanyData[0]._id,
        roleAuthorizationId: id,
        name: '測試管理員',
        manageAuthLevel: 1000,
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      Base.verifyError(res, 21125, '管理角色權限等級資料有誤');
      done();
    });
    test('[400:21132] 此角色名稱為預設不可使用', async (done) => {
      const data = {
        companyId: testCompanyData[0]._id,
        roleAuthorizationId: id,
        name: '經營者',
        manageAuthLevel: 0,
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      Base.verifyError(res, 21132, '此角色名稱為預設不可使用');
      done();
    });
  });

  describe('資料規則驗證', () => {
    test('[400:21121] 公司Id不存在', async (done) => {
      const data = {
        companyId: 'oooxxxoooxxxoooxxx',
        roleAuthorizationId: 'oooxxxoooxxxoooxxx',
        name: '測試管理員',
        manageAuthLevel: 0,
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      Base.verifyError(res, 21121, '公司不存在');
      done();
    });
    test('[400:21126] 角色權限Id不存在', async (done) => {
      const data = {
        companyId: testCompanyData[0]._id,
        roleAuthorizationId: 'oooxxxoooxxxoooxxx',
        name: '測試管理員',
        manageAuthLevel: 0,
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      Base.verifyError(res, 21126, '角色權限Id不存在');
      done();
    });
    test('[400:20008] 原資料(被複製)與操作(產出複製)公司不相同', async (done) => {
      const data = {
        companyId: testCompanyData[1]._id,
        roleAuthorizationId: id,
        name: '測試管理員',
        manageAuthLevel: 0,
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      Base.verifyError(res, 20008, '資料公司不相同');
      done();
    });
    test('[400:21133] 此角色名稱已存在', async (done) => {
      const data = {
        companyId: testCompanyData[0]._id,
        roleAuthorizationId: id,
        name: '測試新角',
        manageAuthLevel: 0,
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      Base.verifyError(res, 21133, '此角色名稱已存在');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 複製公司角色權限-成功', async (done) => {
      const data = {
        companyId: data1.companyId.toString(),
        roleAuthorizationId: id,
        name: '測試管理員',
        manageAuthLevel: 1,
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);

      const col = NativeDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
      const obj = await col.findOne({ companyId: data1.companyId, name: data.name });

      expect(res.status).toBe(200);
      expect(obj.manageAuthLevel).toBe(data.manageAuthLevel);
      expect(obj.isDefault).toBe(false);
      expect(obj.pageAuth).toEqual(data1.pageAuth);
      expect(obj.reportAuth).toEqual(data1.reportAuth);
      expect(obj.__vn).toBe(0);
      expect(obj.__cc).toBe(res.body.traceId);
      expect(obj.__sc).toBe('Erpv3');
      done();
    });
  });
});
