const request = require('supertest');
const { ObjectId } = require('mongodb');
const serviceItemData = require('./seeder/data/serviceItem.json');
const accountData = require('./seeder/data/account.json');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');


describe('更新服務項目資料', () => {
  const _ENDPOINT = '/main/app/api/v1/serviceItems';
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
  })

  describe('需求欄位檢查', () => {
    test('[400:10200] 服務項目名稱為空', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/${serviceItemData.data[0]._id}`)
        .send({ serviceName: '' })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: serviceItemData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
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
      const res = await agent
        .patch(`${_ENDPOINT}/${serviceItemData.data[0]._id}`)
        .send({ description: '' })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: serviceItemData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
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
      const res = await agent
        .patch(`${_ENDPOINT}/${serviceItemData.data[0]._id}`)
        .send({ serviceCategory: '' })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: serviceItemData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
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
      const res = await agent
        .patch(`${_ENDPOINT}/${serviceItemData.data[0]._id}`)
        .send({ cost: 'a' })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: serviceItemData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
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
      const res = await agent
        .patch(`${_ENDPOINT}/${serviceItemData.data[0]._id}`)
        .send({ timeRequired: 'c' })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: serviceItemData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
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
    test('[400:20120] 服務分類資料有誤', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}/${serviceItemData.data[0]._id}`)
        .send({ serviceCategory: 'C8763' })
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: serviceItemData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20120,
        message: '服務分類資料有誤',
        result: null,
      });
      done();
    });

    test('[400:90010] 資料版號有誤(低於現有版本)', async (done) => {
      const upd = { 
        serviceName: 'updateTest',
        cost: 500,
        timeRequired: 360
      }
      const res = await agent
        .patch(`${_ENDPOINT}/${serviceItemData.data[0]._id}`)
        .send(upd)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: -1,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 90010,
        message: 'Data vn fail',
        result: null,
      });
      done();
    });
  })

  describe('成功', () => {
    test('[200] 更新服務項目資料-成功', async (done) => {
      const upd = { 
        serviceName: 'updateTest',
        cost: 500,
        timeRequired: 360
      }
      const res = await agent
        .patch(`${_ENDPOINT}/${serviceItemData.data[0]._id}`)
        .send(upd)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: serviceItemData.data[0].__vn,
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });
      
      const serviceItemCol = NativeDBClient.getCollection(modelCodes.SERVICEITEM);
      expect(res.status).toBe(200);
      const oServiceItem = await serviceItemCol.findOne({ _id: ObjectId(serviceItemData.data[0]._id) });
      expect(oServiceItem.serviceName).toBe(upd.serviceName);
      expect(oServiceItem.cost).toBe(upd.cost);
      expect(oServiceItem.serviceOption[0].timeRequired).toBe(upd.timeRequired);
      expect(oServiceItem.serviceCategory).toBe(serviceItemData.data[0].serviceCategory);
      expect(oServiceItem.modifier.toString()).toBe(accountData.data[0].personId);
      expect(oServiceItem.__cc).toBe(res.body.traceId);
      expect(oServiceItem.__vn).toBe(serviceItemData.data[0].__vn+1);
      expect(oServiceItem.__sc).toBe('Erpv3');
      done();
    });
  });
})
