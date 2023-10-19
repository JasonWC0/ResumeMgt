/**
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
const lodash = require('lodash');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('更新公司基本資料', () => {
  const METHOD = 'PATCH';
  const _ENDPOINT = '/main/app/api/v1/companies';
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
    loginData =  await Base.login(agent);
    headers = {
      Authorization: `Bearer ${loginData.token}`,
      vn: testCompanyData.data[0].__vn,
      sc: 'Erpv3',
      companyId: testCompanyData.data[0]._id
    };
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('需求欄位檢查', () => {
    const updateData = {
      fullName: '仁寶全方位長照機構',
      shortName: '仁寶機構',
      taxId: '12345678',
      licenseNumber: '1111111111',
      registerPlace: {
        postalCode: '114',
        others: ''
      },
      organizationalChart: {
        id: 'fakeFileId2',
        publicUrl: 'files/fakeFile2.jpg',
        mimeType: 'image/jpeg',
      },
      phone: '(02)1234-5678',
      fax: '(02)8765-4321',
      bankAccount: {
        name: '寶寶銀行',
        code: '8888',
        branch: '西湖',
      },
    }
    test('[400:11101] 公司全名空白', async (done) => {
      const _data = { ...updateData };
      _data.fullName = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testCompanyData.data[0]._id}/info`, headers, _data);
      Base.verifyError(res, 11101, '公司全名空白');
      done();
    });

    test('[400:10013] 組織圖Id空白', async (done) => {
      const _data = lodash.cloneDeep(updateData);
      _data.organizationalChart.id = '';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testCompanyData.data[0]._id}/info`, headers, _data);
      Base.verifyError(res, 10013, '檔案Id空白');
      done();
    });
  });

  describe('資料規則驗證', () => {
    const updateData = {
      fullName: '仁寶全方位長照機構',
      shortName: '仁寶機構',
      taxId: '12345678',
      licenseNumber: '1111111111',
      registerPlace: {
        postalCode: '114',
        others: ''
      },
      phone: '(02)1234-5678',
      fax: '(02)8765-4321',
      bankAccount: {
        name: '寶寶銀行',
        code: '8888',
        branch: '西湖',
      },
    }
    test('[404:90008] 公司Id不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/0000x0000x0000/info`, headers, updateData);

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
      const _headers = lodash.cloneDeep(headers);
      _headers.vn = -1;
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testCompanyData.data[0]._id}/info`, _headers, updateData);
      Base.verifyError(res, 90010, 'Data vn fail');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 更新公司基本資料-成功', async (done) => {
      const updateData = {
        fullName: '仁寶全方位長照機構',
        shortName: '仁寶機構',
        taxId: '12345678',
        licenseNumber: '1111111111',
        registerPlace: {
          postalCode: '114',
          others: ''
        },
        phone: '(02)1234-5678',
        fax: '(02)8765-4321',
        bankAccount: {
          name: '(8888) 寶寶銀行',
          branch: '西湖',
        },
        bankAccount2nd: {
          name: '(8888) 寶寶銀行',
          branch: '瑞光',
        },
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${testCompanyData.data[0]._id}/info`, headers, updateData);

      const originData = testCompanyData.data[0];
      const companyCol = NativeDBClient.getCollection(modelCodes.COMPANY);
      const companyData = await companyCol.findOne({ _id: originData._id });

      expect(res.status).toBe(200);
      expect(companyData.fullName).toBe(updateData.fullName);
      expect(companyData.shortName).toBe(updateData.shortName);
      expect(companyData.taxId).toBe(updateData.taxId);
      expect(companyData.licenseNumber).toBe(updateData.licenseNumber);
      expect(companyData.phone).toBe(updateData.phone);
      expect(companyData.fax).toBe(updateData.fax);
      expect(companyData.registerPlace.postalCode).toBe(updateData.registerPlace.postalCode);
      expect(companyData.registerPlace.city).toBe(originData.registerPlace.city);
      expect(companyData.registerPlace.region).toBe(originData.registerPlace.region);
      expect(companyData.registerPlace.village).toBe(originData.registerPlace.village);
      expect(companyData.registerPlace.neighborhood).toBe(originData.registerPlace.neighborhood);
      expect(companyData.registerPlace.road).toBe(originData.registerPlace.road);
      expect(companyData.registerPlace.others).toBe(updateData.registerPlace.others);
      expect(companyData.bankAccount.name).toEqual(updateData.bankAccount.name);
      expect(companyData.bankAccount.branch).toEqual(updateData.bankAccount.branch);
      expect(companyData.bankAccount.account).toEqual(originData.bankAccount.account);
      expect(companyData.bankAccount.number).toEqual(originData.bankAccount.number);
      expect(companyData.bankAccount2nd.name).toEqual(updateData.bankAccount2nd.name);
      expect(companyData.bankAccount2nd.branch).toEqual(updateData.bankAccount2nd.branch);
      expect(companyData.bankAccount2nd.account).toEqual(originData.bankAccount2nd.account);
      expect(companyData.bankAccount2nd.number).toEqual(originData.bankAccount2nd.number);
      expect(companyData.__cc).toBe(res.body.traceId);
      expect(companyData.__vn).toBe(originData.__vn+1);
      expect(companyData.__sc).toBe('Erpv3');

      const tokenRes = await Base.callAPI(agent, 'GET', '/main/app/api/v1/accountInfo', { Authorization:`Bearer ${loginData.token}` });
      expect(tokenRes.body.result.companies[testCompanyData.data[0]._id].fullName).toEqual(updateData.fullName);
      done();
    });
  });
})
