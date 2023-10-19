/**
 * FeaturePath: 通用主系統-通用子系統-連線模組-藥品資料庫
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: default-medicine-service-client.js
 * Project: @erpv3/app-common
 * File Created: 2022-08-10 03:20:08 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const fetch = require('node-fetch');
const { URL, URLSearchParams } = require('url');
const { CustomValidator } = require('../../custom-tools');

const MEDICINE_API = {
  LOGIN: {
    method: 'POST',
    uri: '/external/authorizations/login',
  },
  NHIFINDALL: {
    method: 'GET',
    uri: '/nhidrugs/findAll',
  },
};

class MedicineServiceClass {
  static async login(host, account, password) {
    const uri = `${host}${MEDICINE_API.LOGIN.uri}`;
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({ account, password });
    try {
      const response = await fetch(uri, { method: MEDICINE_API.LOGIN.method, headers, body });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (ex) {
      throw new Error('MedicineService Login fail.');
    }
  }

  static async findList(host, token, qbe) {
    const uri = new URL(`${host}${MEDICINE_API.NHIFINDALL.uri}`);
    const headers = {
      'Content-Type': 'application/json',
      Authorization: token,
    };
    const query = {};
    if (qbe.drugCode && qbe.drugCode !== '') { query.drugCode = qbe.drugCode; }
    if (qbe.atcCode && qbe.atcCode !== '') { query.atcCode = qbe.atcCode; }
    if (qbe.drugNameCHT && qbe.drugNameCHT !== '') { query.drugNameCHT = qbe.drugNameCHT; }
    if (qbe.drugName && qbe.drugName !== '') { query.drugName = qbe.drugName; }
    if (CustomValidator.isNumber(qbe.limit)) { query.limit = qbe.limit; }
    if (CustomValidator.isNumber(qbe.offset)) { query.offset = qbe.offset; }
    if (qbe.order) { query.order = qbe.order; }
    uri.search = new URLSearchParams(query).toString();

    try {
      const response = await fetch(uri, { method: MEDICINE_API.NHIFINDALL.method, headers });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (ex) {
      throw new Error('MedicineService Find fail.');
    }
  }
}

module.exports = MedicineServiceClass;
