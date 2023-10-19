/* eslint-disable no-case-declarations */
/**
 * FeaturePath: 通用主系統-通用子系統-連線模組-sideA
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: default-sidea-service-client.js
 * Project: @erpv3/app-common
 * File Created: 2023-05-09 02:21:00 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const fetch = require('node-fetch');

const Method = {
  GET: 'GET',
  POST: 'POST',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

const API = {
  ReadCaseBedBookList: {
    key: 'ReadCaseBedBookList',
    method: Method.GET,
    uri: '/sidea/app/api/v1/bedbook/caseRecord/{caseId}',
  },
  CheckOutBedBook: {
    key: 'CheckOutBedBook',
    method: Method.PATCH,
    uri: '/sidea/app/api/v1/bedbook/{bookId}/checkout',
  },
};

class SideAServiceClass {
  /**
   * 一般呼叫API
   * @param {String} host HOST
   * @param {Object} headers headers
   * @param {String} api
   * @param {Object} params
   * @param {Object} uriReplace { replaceKey: value }
   * @returns {Object}
   */
  static async callNormalAPI(host, headers, api, params = {}, uriReplace = {}) {
    if (!Object.keys(API).includes(api)) { throw new Error('This api not support.'); }

    let urlStr = `${host}${API[api].uri}`;
    Object.keys(uriReplace).forEach((key) => {
      urlStr = urlStr.replace(key, uriReplace[key]);
    });
    const url = new URL(urlStr);
    const request = {
      method: API[api].method,
      headers,
    };
    switch (API[api].method) {
      case Method.GET:
        const searchParams = new URLSearchParams(params);
        url.search = searchParams;
        break;
      case Method.POST:
        request.body = JSON.stringify(params);
        break;
      case Method.PATCH:
        request.body = JSON.stringify(params);
        break;
      case Method.DELETE:
        break;
      default:
        break;
    }
    try {
      const response = await fetch(url, request);
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch {
      throw new Error(`Call SideA [${api}] fail`);
    }
  }
}

module.exports = { SideAServiceClass, SideAApi: API };
