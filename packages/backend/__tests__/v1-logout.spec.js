/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-logout.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-03-28 05:01:58 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { KeyCloakClient } = require('@erpv3/app-common/shared/connection-clients');
const modelCodes = require('./enums/model-codes');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');

describe('logout', () => {
  const _ENDPOINT = '/main/app/api/v1/logout';
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
    jest.unmock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');
    done();
  });

  describe('Success', () => {
    test('[success]', async (done) => {
      const col = NativeDBClient.getCollection(modelCodes.TOKEN);
      const tokenRes1 = await col.findOne({ token: loginData.token });

      KeyCloakClient.adminLogin.mockResolvedValue({ access_token: 'access_token' });
      KeyCloakClient.logoutUser.mockResolvedValue(true);
      const res = await agent
        .post(`${_ENDPOINT}`)
        .set('Authorization', `Bearer ${loginData.token}`);

      const tokenRes2 = await col.findOne({ token: loginData.token });
      expect(res.status).toBe(200);
      expect(tokenRes2).toBeNull();
      done();
    });
  });
});
