const request = require('supertest');
const lodash = require('lodash');
const moment = require('moment');
const { ObjectId } = require('mongodb');
const { CustomUtils } = require('@erpv3/app-common/custom-tools');
const { ECPayServiceClient } = require('@erpv3/app-common/shared/connection-clients');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testCompanyData = require('./seeder/data/company.json').data;
const testEInvoiceData = require('./seeder/data/eInvoice.json').data;
const Base = require('./basic/basic');
const App = require('../app');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
jest.mock('@erpv3/app-common/shared/connection-clients/default-ecpay-service-client');

describe('開立電子發票', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/eInvoices';
  let agent;
  let headers;
  const data = {
    valid: true,
    _id: new ObjectId(),
    companyId: ObjectId('6209f7102dde25cae862482d'),
    serialString: 'ABC-20220309-005',
    caseId: ObjectId('000000626eb2351d2e140001'),
    identifier: '',
    note: 'zzz',
    vat: true,
    invType: '07',
    taxType: 1,
    specialTaxType: 0,
    amount: 600,
    print: 1,
    customer: {
      name: '金貝貝',
      address: '台北市內湖區瑞北路700號',
      mobile: '0123456789',
      email: 'test@test.com'
    },
    items: [
      {
        name: '玩具',
        count: 1,
        word: '次',
        price: 600,
        taxType: 1,
        amount: 600,
        note: ''
      }
    ],
    __sc: '',
    __cc: '',
    __vn: 0,
  };

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runInitSeeder();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    const loginData = await Base.login(agent);
    headers = {
      Authorization: `Bearer ${loginData.token}`,
      vn: 0,
      sc: 'Erpv3',
      companyId: testCompanyData[0]._id
    }

    testEInvoiceData.forEach((d, index, array) => {
      array[index]._id = ObjectId(d._id);
      array[index].companyId = ObjectId(d.companyId);
      array[index].caseId = ObjectId(d.caseId);
      array[index].creator = ObjectId(d.creator);
      array[index].modifier = ObjectId(d.modifier);
      if (d.issuedDate !== '') {
        array[index].issuedDate = new Date(d.issuedDate);
      }
      array[index].createdAt = new Date(d.createdAt);
      array[index].updatedAt = new Date(d.updatedAt);
    });
    const eInvoiceCol = NativeDBClient.getCollection(modelCodes.EINVOICE);
    await eInvoiceCol.insertMany(testEInvoiceData);
    await eInvoiceCol.insertOne(data);
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-ecpay-service-client');
    done();
  });

  describe('資料規則驗證', () => {
    test('[400:21617] 發票不存在', async (done) => {
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${new ObjectId().toString()}/issue`, headers);
      Base.verifyError(res, 21617, '發票不存在');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 新增電子發票-成功', async (done) => {
      const ecResponse = {
        RtnCode: 1,
        RtnMsg: '開立發票成功',
        InvoiceNo: 'DZ65432289',
        InvoiceDate: moment().add(10,'s').format('YYYY-MM-DD+HH:mm:ss'),
        RandomNumber: '9635'
      }
      const { ECPayServiceClass } = ECPayServiceClient;
      ECPayServiceClass.callAPI.mockResolvedValue(ecResponse);
      const id = lodash.cloneDeep(data._id);
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}/${id.toString()}/issue`, headers);
      const eInvoiceCol = NativeDBClient.getCollection(modelCodes.EINVOICE);
      const obj = await eInvoiceCol.findOne({ _id: data._id });

      expect(res.status).toBe(200);
      expect(obj.invoiceNumber).not.toBe('');
      done();
    });
  });
});