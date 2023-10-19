/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: migration-company-create.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-06-10 03:40:03 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const conf = require('@erpv3/app-common/shared/config');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const corpData = require('./seeder/data/corporation.json');
const testCompanyData = require('./seeder/data/company.json');
const Base = require('./basic/basic');
const App = require('../app');

describe('migration 建立公司', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/migration/api/companies';
  let agent;
  let headers;
  let loginData;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    // loginData = await Base.login(agent);

    headers = {
      vn: 0,
      sc: 'Migration'
    }
    headers[conf.REGISTER.KEY] = `Basic ${conf.REGISTER.CLIENTS[1].CLIENT_SECRET}`;
    testCompanyData.data[0].roleAuthorizations = [
      {
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
      },
      {
        role: 1,
        name: '經營者',
        manageAuthLevel: 0,
        isDefault: true,
        pageAuth: {
          test: {
            index: 2
          },
        },
        reportAuth: {
          test: {
            index: 2,
          },
        },
      },
      {
        role: 1001,
        name: '測試角色',
        manageAuthLevel: 1,
        isDefault: false,
        pageAuth: {
          test: {
            index: 0
          },
        },
        reportAuth: {
          test: {
            index: 0,
          },
        },
      }
    ]
    testCompanyData.data[0].marqueeSetting = {
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
      ]
    }
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:10013] 組織圖的檔案Id空白', async (done) => {
      const _data = lodash.cloneDeep(testCompanyData.data[0]);
      _data.organizationalChart.id = '';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      Base.verifyError(res, 10013, '檔案Id空白');
      done();
    });
  });

  describe('成功', () => {
    const newCorpId = new ObjectId();
    beforeAll(async (done) => {
      const corpCol = NativeDBClient.getCollection(modelCodes.CORPORATION);
      const corp = corpData.data[0];
      corp._id = newCorpId;
      corp.shortName = '仁寶';
      corp.code = 'compal';
      await corpCol.insertOne(corp);
      done();
    });

    test('[200] migration 建立公司-成功', async (done) => {
      const _data = lodash.cloneDeep(testCompanyData.data[0]);
      delete _data._id;
      delete _data.valid;
      _data.corpId = newCorpId.toString();
      _data.fullName = 'testtest';
      _data.shortName = 'testtest';
      _data.code = 'testtest';

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, _data);
      const id = res.body.result.id;

      const companyCol = NativeDBClient.getCollection(modelCodes.COMPANY);
      const roleAuthCol = NativeDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
      const marqueeCol = NativeDBClient.getCollection(modelCodes.MARQUEESETTING);
      const companyRes = await companyCol.findOne({ _id: new ObjectId(id), valid: true });
      const roleAuthRes = await roleAuthCol.find({ companyId: new ObjectId(id), valid: true }).toArray();
      const marqueeRes = await marqueeCol.findOne({ companyId: new ObjectId(id), valid: true });

      expect(res.status).toBe(200);
      expect(companyRes.fullName).toBe(_data.fullName);
      expect(companyRes.shortName).toBe(_data.shortName);
      expect(companyRes.displayName).toBe(_data.displayName);
      expect(roleAuthRes.length).toBe(3);
      expect(marqueeRes.speed).toBe('100');
      expect(marqueeRes.contents).toEqual(_data.marqueeSetting.contents);
      done();
    });
  });
});
