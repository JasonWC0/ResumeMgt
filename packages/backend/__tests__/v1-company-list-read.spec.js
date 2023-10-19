/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-company-list-read.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-04-14 11:58:42 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { ObjectId } = require('mongodb');
const NativeDBClient = require('./basic/native-db-client');
const modelCodes = require('./enums/model-codes');
const testCorporationData = require('./seeder/data/corporation.json').data;
const testCompanyData = require('./seeder/data/company.json').data;
const Base = require('./basic/basic');
const App = require('../app');

describe('取得公司列表', () => {
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
  });

  describe('成功', () => {
    let account1, account2;
    let allSGId, hcSGId;
    beforeAll(async (done) => {
      const person1 = {
        _id: ObjectId('6257c76e37539d677790710a'),
        corpId: ObjectId(testCorporationData[0]._id),
        name: '管理員A',
        employee: {
          status: 1,
          comPersonMgmt: [
            {
              companyId: ObjectId(testCompanyData[0]._id),
            }
          ]
        },
        valid: true,
        __cc: '',
        __vn: 0,
        __sc: '',
      }
      const person2 = {
        _id: ObjectId('6257c7ae85241a8dc81b8771'),
        corpId: ObjectId(testCorporationData[0]._id),
        name: '管理員B',
        employee: {
          status: 1,
          comPersonMgmt: [
            {
              companyId: ObjectId(testCompanyData[1]._id),
            }
          ]
        },
        valid: true,
        __cc: '',
        __vn: 0,
        __sc: '',
      }
      account1 = {
        corpId: ObjectId(testCorporationData[0]._id),
        personId: person1._id,
        type: 0,
        account: 'companyAAdmin',
        companyAdmin: true,
        valid: true,
        __cc: '',
        __vn: 0,
        __sc: '',
      }
      account2 = {
        corpId: ObjectId(testCorporationData[0]._id),
        personId: person2._id,
        type: 0,
        account: 'companyBAdmin',
        companyAdmin: true,
        valid: true,
        __cc: '',
        __vn: 0,
        __sc: '',
      }
      const serviceGroupCol = NativeDBClient.getCollection(modelCodes.SERVICEGROUP);
      const allData = await serviceGroupCol.findOne({ code: 'ALL', valid: true });
      const hcData = await serviceGroupCol.findOne({ code: 'HC', valid: true });
      const companyCol = NativeDBClient.getCollection(modelCodes.COMPANY);
      await companyCol.updateOne({ _id: ObjectId(testCompanyData[0]._id)}, { $set: { serviceGroupId: allData._id } });
      await companyCol.updateOne({ _id: ObjectId(testCompanyData[1]._id)}, { $set: { serviceGroupId: hcData._id } });
      allSGId = allData._id.toString();
      hcSGId = hcData._id.toString();

      const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
      await personCol.insertMany([person1, person2]);
      const accountCol = NativeDBClient.getCollection(modelCodes.ACCOUNT);
      await accountCol.insertMany([account1, account2]);
      done();
    });

    test('[200] 取得公司列表-成功', async (done) => {
      const res = await agent
        .get(`${_ENDPOINT}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(testCompanyData.length);
      res.body.result.forEach((value) => {
        if (value.id === testCompanyData[0]._id) {
          expect(value.account).toBe(account1.account);
          expect(value.corpName).toBe(testCorporationData[0].fullName);
          expect(value.fullName).toBe(testCompanyData[0].fullName);
          expect(value.shortName).toBe(testCompanyData[0].shortName);
          expect(value.serviceGroupId).toBe(allSGId);
          expect(value.vn).toBe(testCompanyData[0].__vn);
        } else if (value.id === testCompanyData[1]._id) {
          expect(value.account).toBe(account2.account);
          expect(value.corpName).toBe(testCorporationData[0].fullName);
          expect(value.fullName).toBe(testCompanyData[1].fullName);
          expect(value.shortName).toBe(testCompanyData[1].shortName);
          expect(value.serviceGroupId).toBe(hcSGId);
          expect(value.vn).toBe(testCompanyData[1].__vn);
        }
      });
      done();
    });
  });
});