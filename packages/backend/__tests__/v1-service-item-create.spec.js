const request = require('supertest');
const { ObjectId } = require('mongodb');
const modelCodes = require('./enums/model-codes');
const accountData = require('./seeder/data/account.json');
const companyData = require('./seeder/data/company.json');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');


describe('創建自訂服務項目', () => {
  const _ENDPOINT = '/main/app/api/v1/serviceItems';
  let agent;
  let loginData;
  const createData = {
    serviceName: 'unitTest',
    serviceCategory: 'HC',
    description: 'test',
    cost: 30,
    timeRequired: 60
  };
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

  describe('需求欄位檢查', () => {
    test('[400:90009] 公司ID在header空白', async (done) => {
      const _data = { ...createData };
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: ''
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 90009,
        message: 'Headers incomplete',
        result: null,
      });
      done();
    })

    test('[400:10200] 服務名稱為空', async (done) => {
      const _data = { ...createData };
      delete _data.serviceName;
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: companyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10200,
        message: '服務項目名稱為空',
        result: null,
      });
      done();
    })

    test('[400:10201] 服務項目描述為空', async (done) => {
      const _data = { ...createData };
      delete _data.description;
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: companyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10201,
        message: '服務項目描述為空',
        result: null,
      });
      done();
    })

    test('[400:10202] 服務項目分類為空', async (done) => {
      const _data = { ...createData };
      delete _data.serviceCategory;
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: companyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10202,
        message: '服務項目分類為空',
        result: null,
      });
      done();
    })

    test('[400:10203] 服務項目費用為空', async (done) => {
      const _data = { ...createData };
      _data.cost = 'a';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: companyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10203,
        message: '服務項目費用為空',
        result: null,
      });
      done();
    })

    test('[400:10204] 服務項目時間為空', async (done) => {
      const _data = { ...createData };
      delete _data.timeRequired;
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: companyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10204,
        message: '服務項目時間為空',
        result: null,
      });
      done();
    })
  })

  describe('驗證規則', () => {
    test('[400:20120] 服務分類格式錯誤', async (done) => {
      const _data = { ...createData };
      _data.serviceCategory = 'CC';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: companyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20120,
        message: '服務分類資料有誤',
        result: null,
      });
      done();
    })

    test('[400:20141] 服務項目已存在', async (done) => {
      const _data = { ...createData };
      _data.serviceName = '測試';
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(_data)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: companyData.data[0]._id,
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20141,
        message: '服務項目已存在',
        result: null,
      });
      done();
    })
  })

  describe('成功', () => {
    test('[200] 創建自訂服務項目-成功', async (done) => {
      const res = await agent
        .post(`${_ENDPOINT}`)
        .send(createData)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: companyData.data[0]._id,
        });

      const serviceItemCol = NativeDBClient.getCollection(modelCodes.SERVICEITEM);
      expect(res.status).toBe(200);
      expect(res.body.result.id).toBeTruthy();
      const oServiceItem = await serviceItemCol.findOne({ _id: ObjectId(res.body.result.id) });
      expect(res.body.result.serviceCode).toBe(oServiceItem.serviceCode);
      expect(oServiceItem.creator.toString()).toBe(accountData.data[0].personId);
      expect(oServiceItem.__vn).toBe(0);
      expect(oServiceItem.__cc).toBe(res.body.traceId);
      expect(oServiceItem.__sc).toBe('Erpv3');
      done();
    });
  });
})
