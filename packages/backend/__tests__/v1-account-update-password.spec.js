/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-account-update-password.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-04-15 02:10:49 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { KeyCloakClient } = require('@erpv3/app-common/shared/connection-clients');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');

describe('update account pwd', () => {
  const _ENDPOINT = '/main/app/api/v1/changePassword';
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

  describe('Required fields', () => {
    test('[400:10016] oldPassword is empty.', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send({ newPassword: 'newPassword' })
        .set('Authorization', `Bearer ${loginData.token}`);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10016,
        message: '舊密碼空白',
        result: null,
      });
      done();
    });
    test('[400:10017] newPassword is empty.', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send({ oldPassword: 'oldPassword' })
        .set('Authorization', `Bearer ${loginData.token}`);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10017,
        message: '新密碼空白',
        result: null,
      });
      done();
    });
  });
  
  describe('Validation rules', () => {
    test('[400:20006] oldPassword is wrong.', async (done) => {
      KeyCloakClient.userLogin.mockResolvedValue();
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send({ oldPassword: 'wrong', newPassword: 'newPassword' })
        .set('Authorization', `Bearer ${loginData.token}`);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20006,
        message: '舊密碼有誤',
        result: null,
      });
      done();
    });
  });

  describe('Success', () => {
    test('[success]', async (done) => {
      KeyCloakClient.userLogin.mockResolvedValue({});
      KeyCloakClient.adminLogin.mockResolvedValue({ access_token: '' });
      KeyCloakClient.updateUserPassword();
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send({ oldPassword: 'oldPassword', newPassword: 'newPassword' })
        .set('Authorization', `Bearer ${loginData.token}`);

      expect(res.status).toBe(200);
      done();
    });
  });
});
