/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-role-authorization-create.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-04-19 11:38:54 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('創建公司角色權限', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/roleAuthorizations';
  let agent;
  let loginData;
  let headers;

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
    const data1 = {
      companyId: ObjectId(testCompanyData[0]._id),
      role: 0,
      name: '管理者',
      manageAuthLevel: 0,
      isDefault: false,
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
      __vn: 0,
      __cc: '',
      __sc: '',
    }
    const data2 = { ...data1, role: 1005, name: '測試新角'}
    await col.insert([data1, data2]);
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
        name: '測試管理員',
        manageAuthLevel: 1,
        pageAuth: {
          newTest: {
            index: 0,
          }
        },
        reportAuth: {
          newTest: {
            index: 1,
          }
        },
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      Base.verifyError(res, 11102, '公司ID空白')
      done();
    });
    test('[400:11118] 角色名稱空白', async (done) => {
      const data = {
        companyId: testCompanyData[0]._id,
        name: '',
        manageAuthLevel: 1,
        pageAuth: {
          newTest: {
            index: 0,
          }
        },
        reportAuth: {
          newTest: {
            index: 1,
          }
        },
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      Base.verifyError(res, 11118, '角色名稱空白')
      done();
    });
    test('[400:11119] 管理角色權限等級空白', async (done) => {
      const data = {
        companyId: testCompanyData[0]._id,
        name: '測試管理員',
        manageAuthLevel: '',
        pageAuth: {
          newTest: {
            index: 0,
          }
        },
        reportAuth: {
          newTest: {
            index: 1,
          }
        },
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      Base.verifyError(res, 11119, '管理角色權限等級空白');
      done();
    });
    test('[400:21125] 管理角色權限等級資料有誤', async (done) => {
      const data = {
        companyId: testCompanyData[0]._id,
        name: '測試管理員',
        manageAuthLevel: 1000,
        pageAuth: {
          newTest: {
            index: 0,
          }
        },
        reportAuth: {
          newTest: {
            index: 1,
          }
        },
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      Base.verifyError(res, 21125, '管理角色權限等級資料有誤');
      done();
    });
    test('[400:21132] 此角色名稱為預設不可使用', async (done) => {
      const data = {
        companyId: testCompanyData[0]._id,
        name: '經營者',
        manageAuthLevel: 0,
        pageAuth: {
          newTest: {
            index: 0,
          }
        },
        reportAuth: {
          newTest: {
            index: 1,
          }
        },
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
        name: '測試管理員',
        manageAuthLevel: 1,
        pageAuth: {
          newTest: {
            index: 0,
          }
        },
        reportAuth: {
          newTest: {
            index: 1,
          }
        },
      }
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21121,
        message: '公司不存在',
        result: null,
      });
      done();
    });
    test('[400:21133] 此角色名稱已存在', async (done) => {
      const data = {
        companyId: testCompanyData[0]._id,
        name: '測試新角',
        manageAuthLevel: 0,
        pageAuth: {
          newTest: {
            index: 0,
          }
        },
        reportAuth: {
          newTest: {
            index: 1,
          }
        },
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      Base.verifyError(res, 21133, '此角色名稱已存在');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 創建公司角色權限-成功', async (done) => {
      const data = {
        companyId: testCompanyData[0]._id,
        name: '測試管理員',
        manageAuthLevel: 1,
        pageAuth: {
          newTest: {
            index: 0,
          }
        },
        reportAuth: {
          newTest: {
            index: 1,
          }
        },
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);

      const col = NativeDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
      const obj = await col.findOne({ companyId: data.companyId, name: data.name });

      expect(res.status).toBe(200);
      expect(obj.manageAuthLevel).toBe(data.manageAuthLevel);
      expect(obj.role).toBe(1006);
      expect(obj.isDefault).toBe(false);
      expect(obj.pageAuth).toEqual(data.pageAuth);
      expect(obj.reportAuth).toEqual(data.reportAuth);
      expect(obj.__vn).toBe(0);
      expect(obj.__cc).toBe(res.body.traceId);
      expect(obj.__sc).toBe('Erpv3');
      done();
    });
  });
});

