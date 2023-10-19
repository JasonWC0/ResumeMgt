const request = require('supertest');
const { ObjectId } = require('mongodb');
const conf = require('@erpv3/app-common/shared/config');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');

describe('讀取PDF檔案列表', () => {
  const _ENDPOINT = '/main/app/api/v1/pdfs';
  let agent;
  let headers;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);

    const operator = {
      personId: '64425d1c185f53ed60fcf656',
      name: 'test',
      companyId: '64425d3c60cd50297f85cd90',
      region: 'TW',
      account: 'testAccount',
    }
    agent = request.agent(new App().app);
    headers = {
      vn: '',
      sc: 'Erpv3',
      companyId: 'testCompanyId',
      'X-Operator-Info': Buffer.from(JSON.stringify(operator)).toString('base64'),
    }
    headers[conf.REGISTER.KEY] = `Basic ${conf.REGISTER.CLIENTS[1].CLIENT_SECRET}`;

    const data = [{
      valid: true,
      __vn: 0,
      __cc: '2fdf7961-eacc-40c3-957b-2015c5503ee5',
      __sc: 'Erpv3',
      creator: ObjectId('64425d1c185f53ed60fcf656'),
      modifier: ObjectId('64425d1c185f53ed60fcf656'),
      type: 'dcCaseClosedCover',
      companyId: ObjectId('64425d3c60cd50297f85cd90'),
      year: null,
      month: null,
      date: new Date('2023/04/23').toISOString(),
      startDate: null,
      endDate: null,
      serviceCode: '',
      produceTime: null,
      genStatus: 0,
      reportFile: {
        id: '',
        fileName: '',
        publicUrl: '',
        updatedAt: null,
        mimeType: ''
      },
      requestInfo: {
        url: '/main/app/api/v1/pdfs/generateMultiPages/dcCaseClosedCover',
        body: {},
        personId: ObjectId('64425d1c185f53ed60fcf656'),
        companyId: ObjectId('64425d3c60cd50297f85cd90'),
      },
      once: true,
      createdAt: new Date('2023/04/23').toISOString(),
      updatedAt: new Date('2023/04/23').toISOString(),
    },
    {
      valid: true,
      __vn: 0,
      __cc: '2fdf7961-eacc-40c3-957b-2015c5503ee5',
      __sc: 'Erpv3',
      creator: ObjectId('64425d1c185f53ed60fcf656'),
      modifier: ObjectId('64425d1c185f53ed60fcf656'),
      type: 'dcCaseClosedCover',
      companyId: ObjectId('64425d3c60cd50297f85cd90'),
      year: null,
      month: null,
      date: new Date('2023/04/22').toISOString(),
      startDate: null,
      endDate: null,
      serviceCode: '',
      produceTime: null,
      genStatus: 1,
      reportFile: {
        id: '64462c088d024ec9d3939596',
        fileName: '機構全名_日照_個案結案封面_20230424.pdf',
        publicUrl: 'https://storage.googleapis.com/scs-erpv3-test/company/64425d3c60cd50297f85cd90/pdfFile/機構全名_日照_個案結案封面_20230424.pdf/NjUzZWFhY2UtNWE3ZS00MjcyLWE2NGMtMDAzY2IzNmNlNDEz|機構全名_日照_個案結案封面_20230424.pdf',
        updatedAt: new Date('2023/04/22').toISOString(),
        mimeType: 'application/pdf'
      },
      requestInfo: {
        url: '/main/app/api/v1/pdfs/generateMultiPages/dcCaseClosedCover',
        body: {},
        personId: ObjectId('64425d1c185f53ed60fcf656'),
        companyId: ObjectId('64425d3c60cd50297f85cd90'),
      },
      once: true,
      createdAt: new Date('2023/04/24').toISOString(),
      updatedAt: new Date('2023/04/24').toISOString(),
    }];
    const reportCol = NativeDBClient.getCollection(modelCodes.REPORTMAIN);
    await reportCol.insertMany(data);
    done();
  });

  afterAll(async (done) => {
    await Base.closeDBClient();
    done();
  });

  describe('成功', () => {
    test('[200] 讀取PDF檔案列表-成功', async (done) => {
      const res = await Base.callAPI(agent, 'GET', `${_ENDPOINT}/dcCaseClosedCover`, headers, {}, { companyId: '64425d3c60cd50297f85cd90', query: '-date'});
      expect(res.status).toBe(200);
      expect(res.body.result.length).toBe(2);
      done();
    });
  });
});