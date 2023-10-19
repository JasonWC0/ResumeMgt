const request = require('supertest');
const { ObjectId } = require('mongodb');
const serviceItemData = require('./seeder/data/serviceItem.json');
const accountData = require('./seeder/data/account.json');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const modelCodes = require('./enums/model-codes');
const App = require('../app');


describe('刪除自訂服務項目', () => {
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

  describe('成功', () => {
    test('[200] 刪除自訂服務項目-成功', async (done) => {
      const res = await agent
        .delete(`${_ENDPOINT}/${serviceItemData.data[0]._id}`)
        .set({
          Authorization: `Bearer ${loginData.token}`,
          vn: '',
          sc: 'Erpv3',
          companyId: 'testCompanyId'
        });

      expect(res.status).toBe(200);
      const serviceItemCol = NativeDBClient.getCollection(modelCodes.SERVICEITEM);
      const oServiceItem = await serviceItemCol.findOne({ _id: ObjectId(serviceItemData.data[0]._id)});
      expect(oServiceItem.valid).toBeFalsy();
      expect(oServiceItem.deleter.toString()).toBe(accountData.data[0].personId);
      expect(oServiceItem.__cc).toBe(res.body.traceId);
      expect(oServiceItem.__vn).toBe(serviceItemData.data[0].__vn+1);
      expect(oServiceItem.__sc).toBe('Erpv3');
      done();
    });
  });
})
