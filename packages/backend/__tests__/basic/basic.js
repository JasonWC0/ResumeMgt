/**
 * Accountable: JoyceS Hsu, Wilbert Yang
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: basic.js
 * Project: @erpv3/backend
 * File Created: 2022-02-14 11:26:32 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongodb');
const path = require('path');
const lodash = require('lodash');
const fsExtra = require('fs-extra');
const conf = require('@erpv3/app-common/shared/config');
const { DefaultDBClient, KeyCloakClient } = require('@erpv3/app-common/shared/connection-clients');
const init = require('../../app-initializer');
const NativeDBClient = require('./native-db-client');
const seeder = require('../seeder');
const testAccountData = require('../seeder/data/account.json');
const testCompanyData = require('../seeder/data/company.json');
const testCorpData = require('../seeder/data/corporation.json');
const modelCodes = require('../enums/model-codes');
const customTools = require('./custom-tools');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');

const prepareLoginData = async () => {
  // check corp
  testCorpData.data[0]._id = new ObjectId(testCorpData.data[0]._id);
  testCorpData.data[0].valid = true;
  const corpCol = NativeDBClient.getCollection(modelCodes.CORPORATION);
  await corpCol.findOneAndUpdate({ _id: testCorpData.data[0]._id }, { $set: testCorpData.data[0] }, { upsert: true });

  const serviceGroupCol = NativeDBClient.getCollection(modelCodes.SERVICEGROUP);
  const serviceGroupAllRes = await serviceGroupCol.findOne({ code: 'ALL'});
  const companyCol = NativeDBClient.getCollection(modelCodes.COMPANY);
  await companyCol.updateOne({ _id: ObjectId(testCompanyData.data[0]._id) }, { $set: { serviceGroupId: serviceGroupAllRes._id } });

  // create account
  const accountCol = NativeDBClient.getCollection(modelCodes.ACCOUNT);
  const objs = lodash.cloneDeep(testAccountData.data);
  for (const obj of objs) {
    obj.corpId = new ObjectId(obj.corpId);
    obj.personId = new ObjectId(obj.personId);
  }
  await accountCol.deleteMany({});
  await accountCol.insertMany(objs);

  // create person
  const personData = {
    _id: ObjectId(objs[0].personId),
    corpId: ObjectId(objs[0].corpId),
    name: {
      cipher: await encryptionData(testCorpData.data[0].__enc, '管理員'),
    },
    employee: {
      comPersonMgmt: [{
        companyId: ObjectId(testCompanyData.data[0]._id),
        startDate: new Date('2022/01/01'),
        roles: [0, 1],
      },
      {
        companyId: ObjectId(testCompanyData.data[1]._id),
        startDate: new Date('2022/01/01'),
        roles: [0, 1],
      }],
    },
    valid: true,
  }
  const personCol = NativeDBClient.getCollection(modelCodes.PERSON);
  await personCol.insertOne(personData);
}

const login = async (_agent, account = 'admin', pwd = '12345678') => {
  await prepareLoginData();
  const loginData = {
    account,
    pwd,
  }
  KeyCloakClient.userLogin.mockResolvedValue({});
  const response = await _agent.post('/main/app/api/v1/login').send(loginData)
  return response.body.result;
};

const initApp = async(testStamp) => {
    await init.tryDefaultDatabase(testStamp);
    await init.tryDefaultFile();
    await init.tryNativeDatabase(testStamp);
}

const initNativeDBClient = async(testStamp) => {
  const def = { ...conf.DATABASES.DEFAULT_MONGO };
  def.DB_NAME = `${conf.DATABASES.DEFAULT_MONGO.DB_NAME}_${testStamp}`;
  def.URI = def.URI.replace(conf.DATABASES.DEFAULT_MONGO.DB_NAME, def.DB_NAME);

  await NativeDBClient.create(def.URI, {
    auth: {
      username: def.USER,
      password: def.PASS,
    },
  }, def.DB_NAME);
}

const runInitSeeder = async() => {
  await init.runSeeder();
}

const runTestSeeder = async() => {
  await seeder.run()
}

const closeDBClient = async() => {
  await DefaultDBClient.close();
  await NativeDBClient.drop();
  await NativeDBClient.close();
}

const clearTestFile = async() => {
  await fsExtra.removeSync(path.resolve(__dirname, `../${conf.FILE.TEMP.FOLDER}`));
}

const callAPI = async (_agent, _method, url, headers, body={}, _query={}) => {
  const method = _method.toUpperCase();
  switch (method) {
    case 'POST':
      return _agent.post(url).set(headers).send(body).query(_query);
    case 'PATCH':
      return _agent.patch(url).set(headers).send(body).query(_query);
    case 'GET':
      return _agent.get(url).set(headers).query(_query);
    case 'DELETE':
      return _agent.delete(url).set(headers).query(_query);
    default:
      return undefined;
  }
}

const verifyError = (res, errorCode, errorMsg) => {
  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    traceId: expect.any(String),
    code: errorCode,
    message: errorMsg,
    result: null,
  });
}

const encryptionData = async (corpEncData, value) => {
  const keys = await fsExtra.readJson(corpEncData.provider);
  const secretKey = keys[corpEncData.keyId];
  const data = await customTools.encryptionWithAESCBCPKCS7(value, secretKey.key, secretKey.iv);
  return data;
}

const decryptionData = async (corpEncData, value) => {
  const keys = await fsExtra.readJson(corpEncData.provider);
  const secretKey = keys[corpEncData.keyId];
  const data = await customTools.decryptionWithAESCBCPKCS7(value, secretKey.key, secretKey.iv);
  return data;
}

module.exports = {
  login,
  initApp,
  initNativeDBClient,
  runTestSeeder,
  runInitSeeder,
  closeDBClient,
  clearTestFile,
  prepareLoginData,
  callAPI,
  verifyError,
  encryptionData,
  decryptionData,
};
