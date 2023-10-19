
const request = require('supertest');
const lodash = require('lodash');
const { ObjectId } = require('mongodb');
const conf = require('@erpv3/app-common/shared/config');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const testFormResultData = require('./seeder/data/form-result.json');
const testFormReviewStatusData = require('./seeder/data/form-review-status.json');
const Base = require('./basic/basic');
const App = require('../app');

function transObjectId(obj, fields) {
  const _obj = lodash.cloneDeep(obj);
  for(const field of fields) {
    const parts = field.split('.');
    if (parts.length === 1) {
      lodash.set(_obj, field, ObjectId(obj[field]));
      continue;
    }

    let value = lodash.cloneDeep(obj);
    for (let i = 0; i < parts.length; i++) {
      value = value[parts[i]];
    }
    lodash.set(_obj, field, ObjectId(value));
  }
  return _obj;
}

describe('讀取個案最新表單結果列表', () => {
  const METHOD = 'GET';
  const _ENDPOINT = '/main/app/api/v1/formResults/all/gByCase/newestList';
  let agent;
  let headers;

  const operator = {
    personId: testFormResultData.data[0].filler.personId,
    name: 'test',
    companyId: testFormResultData.data[0].companyId,
    region: 'TW',
  }
  beforeAll(async (done) => {
    const testStamp = Date.now();
    await Base.initApp(testStamp);
    await Base.initNativeDBClient(testStamp);
    await NativeDBClient.clearData();
    await Base.runTestSeeder();

    agent = request.agent(new App().app);
    // await Base.login(agent);

    headers = {
      vn: '',
      sc: 'Erpv3',
      companyId: testFormResultData.data[0].companyId,
      'X-Operator-Info': Buffer.from(JSON.stringify(operator)).toString('base64'),
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
    test('[400:10507] 次類別空白', async (done) => {
      const q = {
        t: '',
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, q);
      Base.verifyError(res, 10507, '次類別空白');
      done();
    });
  });

  describe('成功', () => {
    beforeAll(async (done) => {
      const formResultCol = NativeDBClient.getCollection(modelCodes.FORMRESULT);
      const formResData = transObjectId(testFormResultData.data[0], ['_id', 'formId', 'companyId', 'caseId', 'filler.personId', 'creator', 'modifier']);
      formResData.fillDate = new Date(formResData.fillDate);
      formResData.submittedAt = new Date(formResData.submittedAt);
      const formResData2 = transObjectId(testFormResultData.data[3], ['_id', 'formId', 'companyId', 'caseId', 'filler.personId', 'creator', 'modifier']);
      formResData2.fillDate = new Date(formResData2.fillDate);
      formResData2.submittedAt = new Date(formResData2.submittedAt);
      const formResData3 = transObjectId(testFormResultData.data[4], ['_id', 'formId', 'companyId', 'caseId', 'filler.personId', 'creator', 'modifier']);
      formResData3.fillDate = new Date(formResData3.fillDate);
      formResData3.submittedAt = new Date(formResData3.submittedAt);
      const formResData4 = transObjectId(testFormResultData.data[1], ['_id', 'formId', 'companyId', 'caseId', 'filler.personId', 'creator', 'modifier']);
      formResData4.fillDate = new Date(formResData4.fillDate);
      formResData4.submittedAt = new Date(formResData4.submittedAt);
      const formResData5 = transObjectId(testFormResultData.data[2], ['_id', 'formId', 'companyId', 'caseId', 'filler.personId', 'creator', 'modifier']);
      formResData5.fillDate = new Date(formResData5.fillDate);
      formResData5.submittedAt = new Date(formResData5.submittedAt);
      await formResultCol.insertMany([formResData, formResData2, formResData3, formResData4, formResData5]);

      const reviewStatusCol = NativeDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
      const reviewStatusData = transObjectId(testFormReviewStatusData.data[0], ['_id', 'fid']);
      const reviewStatusData2 = transObjectId(testFormReviewStatusData.data[2], ['_id', 'fid']);
      const reviewStatusData3 = transObjectId(testFormReviewStatusData.data[3], ['_id', 'fid']);
      const reviewStatusData4 = transObjectId(testFormReviewStatusData.data[1], ['_id', 'fid']);
      const reviewStatusData5 = transObjectId(testFormReviewStatusData.data[4], ['_id', 'fid']);
      await reviewStatusCol.insertMany([reviewStatusData, reviewStatusData2, reviewStatusData3, reviewStatusData4, reviewStatusData5]);
      done();
    });

    test('[200] 讀取表單結果列表-成功', async (done) => {
      const q = {
        t: `${testFormResultData.data[0].type},${testFormResultData.data[4].type}`,
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, q);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(2);
      res.body.result.forEach((r) => {
        if (r.caseId === testFormResultData.data[0].caseId) {
          expect(r.list).toHaveLength(2);
        } else if (r.caseId === testFormResultData.data[4].caseId) {
          expect(r.list).toHaveLength(1);
          expect(r.list[0].category).toEqual(testFormResultData.data[4].category);
          expect(r.list[0].type).toEqual(testFormResultData.data[4].type);
          expect(r.list[0].fillDate).toEqual(testFormResultData.data[4].fillDate);
          expect(r.list[0].nextFillDate).toEqual(testFormResultData.data[4].nextEvaluationDate);
        }
      });
      done();
    });

    test('[200] 讀取表單結果列表-成功(filter type)', async (done) => {
      const q = {
        t: `${testFormResultData.data[0].type}`,
      };
      const res = await Base.callAPI(agent, METHOD, `${_ENDPOINT}`, headers, {}, q);

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(1);
      expect(res.body.result[0].caseId).toEqual(testFormResultData.data[1].caseId);
      expect(res.body.result[0].list[0].category).toEqual(testFormResultData.data[1].category);
      expect(res.body.result[0].list[0].type).toEqual(testFormResultData.data[1].type);
      expect(res.body.result[0].list[0].fillDate).toEqual(testFormResultData.data[1].fillDate);
      expect(res.body.result[0].list[0].nextFillDate).toEqual(testFormResultData.data[1].nextEvaluationDate);
      done();
    });
  });
});
