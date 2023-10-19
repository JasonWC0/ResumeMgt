/**
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: v1-account-reset-password.spec.js
 * Project: @erpv3/backend
 * File Created: 2022-05-31 03:28:24 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const request = require('supertest');
const { KeyCloakClient } = require('@erpv3/app-common/shared/connection-clients');
const NativeDBClient = require('./basic/native-db-client');
const Base = require('./basic/basic');
const App = require('../app');

jest.mock('@erpv3/app-common/shared/connection-clients/default-keycloak-client');

describe('帳號重設密碼', () => {
  const _ENDPOINT = '/main/app/api/v1/resetPassword';
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

  describe('需求欄位檢查', () => {
    test('[400:10011] 帳號空白', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send({ newPassword: 'newPassword' })
        .set('Authorization', `Bearer ${loginData.token}`);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 10011,
        message: '帳號空白',
        result: null,
      });
      done();
    });
    test('[400:10017] 新密碼空白', async (done) => {
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send({ account: 'nurse1' })
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
  
  describe('資料規則驗證', () => {
    test('[400:20007] 帳號不存在', async (done) => {
      KeyCloakClient.userLogin.mockResolvedValue();
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send({ account: 'wrong', newPassword: 'newPassword' })
        .set('Authorization', `Bearer ${loginData.token}`);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        traceId: expect.any(String),
        code: 20007,
        message: '帳號不存在',
        result: null,
      });
      done();
    });
  });

  describe('成功', () => {
    test('[200] 帳號重設密碼 - 成功', async (done) => {
      KeyCloakClient.userLogin.mockResolvedValue({});
      KeyCloakClient.adminLogin.mockResolvedValue({ access_token: '' });
      KeyCloakClient.updateUserPassword();
      const res = await agent
        .patch(`${_ENDPOINT}`)
        .send({ account: 'nurse1', newPassword: 'newPassword' })
        .set('Authorization', `Bearer ${loginData.token}`);

      expect(res.status).toBe(200);
      done();
    });
  });
});