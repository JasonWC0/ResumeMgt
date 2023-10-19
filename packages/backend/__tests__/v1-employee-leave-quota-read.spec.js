const request = require('supertest');
const lodash = require('lodash');
const moment = require('moment');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');
const employeeLeaveHistoryData = require('./seeder/data/employee-leave-history.json');
const defaultLeaveQuota = require('./seeder/data/leaveType.json').default;
const testCompanyData = require('./seeder/data/company.json').data;

describe('查詢請假額度', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/leaves/employeeQuota';
  let agent;
  let loginData;
  const companyId = employeeLeaveHistoryData.data[0].companyId;
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
      companyId: companyId,
    };

    const _date = moment().startOf('D').add(1, 'd').format('MM/DD');
    const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
    await personCol.updateOne({ _id: ObjectId(employeeLeaveHistoryData.data[0].personId)}, { $set: {
      employee: {
        centralGovSystemAccount: null,
        comPersonMgmt: [
          {
            employmentType: 1,
            companyId: ObjectId('6257c1bb05ff2eb99aff6832'),
            interviewNote: '中肯',
            employeeStatus: 1,
            startDate: new Date(`1990/${_date}`),
            endDate: null
          }
        ],
        contact: {
          name: '黃虎',
          mobile: '0937000111',
          phoneH: '02-25232649',
          relationship: '兒子'
        },
        serviceItemQualification: [
          0,
          2
        ],
        employeeCategory: null
      },
    }});
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  })

  describe('資料規則驗證', () => {
    test('[400:10508] 公司不存在', async (done) => {
      const query = {
        personId: employeeLeaveHistoryData.data[0].personId.toString(),
      }
      const fakeHeader = lodash.cloneDeep(headers);
      fakeHeader.companyId = 'fake';
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, fakeHeader, {}, query);


      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 21121,
        message: '公司不存在',
        result: null,
      });
      done();
    });

    test('[400:20137] 人員不為此公司員工', async (done) => {
      const query = {
        personId: employeeLeaveHistoryData.data[0].personId.toString(),
      }
      const diffComHeader = lodash.cloneDeep(headers);
      diffComHeader.companyId = testCompanyData[0]._id;

      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, diffComHeader, {}, query);


      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20137,
        message: '人員不為此公司員工',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[取得請假額度: 成功]', async (done) => {
      const query = {
        personId: employeeLeaveHistoryData.data[0].personId.toString(),
      }
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, query);

      expect(res.status).toBe(200);
      const annualDays = defaultLeaveQuota.annual._24y0m * 8 - employeeLeaveHistoryData.data[3].leaveDetail['2023/01/02'].hours;
      const personalDays = defaultLeaveQuota.personal * 8
        - employeeLeaveHistoryData.data[0].leaveDetail['2023/01/05'].hours
        - employeeLeaveHistoryData.data[2].leaveDetail['2023/01/02'].hours
        - employeeLeaveHistoryData.data[2].leaveDetail['2023/01/03'].hours
        - employeeLeaveHistoryData.data[2].leaveDetail['2023/01/04'].hours;
      expect(res.body.result.annual).toBe(annualDays);
      expect(res.body.result.personal).toBe(personalDays);
      done();
    });
  });
})
