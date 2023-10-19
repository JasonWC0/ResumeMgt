const request = require('supertest');
const { ObjectId } = require('mongodb');
const conf = require('@erpv3/app-common/shared/config');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');

describe('機構建立預設菜色(開站)', () => {
  const METHOD = 'POST';
  const _ENDPOINT = '/main/app/api/v1/dishes/init';
  let agent;
  let headers;

  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();

    agent = request.agent(new App().app);
    headers = {
      sc: 'Erpv3',
      companyId: 'testCompanyId',
    }
    headers[conf.REGISTER.KEY] = `Basic ${conf.REGISTER.CLIENTS[1].CLIENT_SECRET}`;
    done();
  });

  afterAll(async (done) => {
    await NativeDBClient.clearData();
    await Base.closeDBClient();
    done();
  });

  describe('需求欄位檢查', () => {
    test('[400:11102] 公司ID空白', async (done) => {
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, {});
      Base.verifyError(res, 11102, '公司ID空白');
      done();
    });
  });

  describe('成功', () => {
    test('[200] 機構建立預設菜色(開站)-成功', async (done) => {
      const companyId = new ObjectId().toString();
      const data = {
        companyIds: [companyId],
      }
      const res = await Base.callAPI(agent, METHOD, _ENDPOINT, headers, data);
      const dishCategoryCol = NativeDBClient.getCollection(modelCodes.DISHCATEGORIES);
      const dishCol = NativeDBClient.getCollection(modelCodes.DISH);

      expect(res.status).toBe(200);
      const dishCategoryRes = await dishCategoryCol.find({ companyId }).toArray();
      const dishRes = await dishCol.find({ companyId }).toArray();
      expect(dishCategoryRes).toHaveLength(7);
      expect(dishRes).toHaveLength(690);
      done();
    });
  });
});