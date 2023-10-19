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
const util = require('util')
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testData = require('./seeder/data/employee.json');
const Base = require('./basic/basic');
const App = require('../app');
const { employeeStatusCodes, employmentStatusHistoryCodes } = require('@erpv3/app-core/domain');

describe('員工復職/離職', () => {
  let agent;
  let loginData;
  let personCol;

  const personData = testData.person[0];
  let _ENDPOINT = `/main/app/api/v1/employees/%s/personnelChange`;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    personCol = NativeDBClient.getCollection(modelCodes.PERSON);
    personData._id = ObjectId(personData._id);
    await personCol.insertOne(personData);

    agent = request.agent(new App().app);
    loginData = await Base.login(agent);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('資料規則驗證', () => {
    test('[400:20101] 員工資料不存在', async (done) => {
      const reqBody = {
        date: '2022/05/27',
        employeeStatus: employeeStatusCodes.Incumbent,
      };
      const endpoint = util.format(_ENDPOINT, 'stevejobs')
      const companyId = personData.employee.comPersonMgmt[0].companyId;
      const res = await agent
        .post(`${endpoint}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId
        })
        .send(reqBody);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20112,
        message: '員工資料不存在',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    const reqBody = {
      date: '2022/05/27',
    };
    test('[200] 員工復職-成功', async (done) => {
      reqBody.employeeStatus = employeeStatusCodes.Incumbent;
      const endpoint = util.format(_ENDPOINT, personData._id)
      const companyId = personData.employee.comPersonMgmt[0].companyId;
      const res = await agent
        .post(`${endpoint}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId
        })
        .send(reqBody);

      expect(res.status).toBe(200);
      
      const updRes = await personCol.findOne({ _id: ObjectId(personData._id)})
      const cpm = updRes.employee.comPersonMgmt.filter(c => c.companyId.toString() === companyId)
      expect(cpm[0].endDate).toBe(null);

      const employmentHistoryCol = NativeDBClient.getCollection(modelCodes.EMPLOYMENTHISTORY);
      const oEmploymentHistory = await employmentHistoryCol.findOne({
        personId: ObjectId(personData._id),
        companyId: ObjectId(companyId),
      })
      expect(oEmploymentHistory).toBeTruthy();
      expect(oEmploymentHistory.status).toBe(employmentStatusHistoryCodes.Reinstatement);
      done();
    });

    test('[200] 員工離職-成功', async (done) => {
      reqBody.employeeStatus = employeeStatusCodes.Resign;
      const endpoint = util.format(_ENDPOINT, personData._id)
      const companyId = personData.employee.comPersonMgmt[1].companyId;
      const res = await agent
        .post(`${endpoint}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId
        })
        .send(reqBody);

      expect(res.status).toBe(200);
      
      const updRes = await personCol.findOne({ _id: ObjectId(personData._id)})
      const cpm = updRes.employee.comPersonMgmt.filter(c => c.companyId.toString() === companyId)
      expect(cpm[0].endDate.toUTCString()).toBe(new Date(2022, 4, 27).toUTCString());

      const employmentHistoryCol = NativeDBClient.getCollection(modelCodes.EMPLOYMENTHISTORY);
      const oEmploymentHistory = await employmentHistoryCol.findOne({
        personId: ObjectId(personData._id),
        companyId: ObjectId(companyId),
      })
      expect(oEmploymentHistory).toBeTruthy();
      expect(oEmploymentHistory.status).toBe(employmentStatusHistoryCodes.Resign);
      done();
    });
  });
})
