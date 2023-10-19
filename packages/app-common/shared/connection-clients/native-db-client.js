/* eslint-disable no-unused-vars */
/**
 * FeaturePath: 通用主系統-通用子系統-連線模組-NativeMongoDB
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: native-db-client.js
 * Project: @erpv3/app-common
 * File Created: 2023-05-03 01:56:15 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
const { MongoClient } = require('mongodb');
const { customLogger, customArgvs } = require('../../custom-tools');

const _REJ_CLN_ENV = ['production', 'release', 'stage'];

let _uri = '';
let _instance = null;
let _conn = null;
let _db = null;
let _defaultOptions = {
  auth: {
    username: null,
    password: null,
  },
  useUnifiedTopology: true,
  useNewUrlParser: true,
  connectTimeoutMS: 3 * 1000,
};

class NativeDBClient {
  /**
   * Create db instance
   * @param {String} uri db uri
   * @param {Object} options db 設定參數
   * @param {String} dbName db name
   * @returns {void} void
   */
  static async create(uri, options, dbName) {
    if (!uri || uri === '') {
      throw new Error('Connect uri is empty');
    }
    _uri = uri;

    if (options && Object.keys(options).length > 0) {
      _defaultOptions = { ..._defaultOptions, ...options };
    }

    const { auth } = _defaultOptions;
    if (auth) {
      const { username, password } = auth;
      if (!username || !password || username === '' || password === '') {
        delete _defaultOptions.auth;
      }
    }

    _instance = new MongoClient(_uri, _defaultOptions);
    return NativeDBClient.tryConnect(dbName);
  }

  /**
   * Try connect to DB
   * @param {String} dbName DB名稱
   * @returns {Object}
   */
  static tryConnect(dbName) {
    _conn = _instance.connect();
    _db = _instance.db(dbName);
    return _db;
  }

  /**
  * 取得collection
  * @param {string} name collection名稱
  * @returns {import('mongoose').Collection}
  */
  static getCollection(name) {
    if (!name || name === '') {
      throw new Error('Collection name is empty');
    }

    return _db.collection(name);
  }

  /**
   * 清除DB資料
   * @returns {Promise}
   */
  static async clearData() {
    if (_REJ_CLN_ENV.includes(customArgvs.env)) {
      customLogger.info(`Not allowed to clean ${customArgvs.env}`);
      return;
    }
    const cols = await _db.collections();

    const tasks = [];
    for (const col of cols) {
      tasks.push(col.deleteMany());
    }
    await Promise.all(tasks);
  }

  /**
   * 關閉DB連線
   * @returns {Promise}
   */
  static async close() {
    return _instance.close();
  }

  /**
   * 拋棄DB
   * @returns {undefine}
   */
  static async drop() {
    if (_REJ_CLN_ENV.includes(customArgvs.env)) {
      customLogger.info(`Not allowed to clean ${customArgvs.env}`);
      return;
    }
    _db.dropDatabase();
  }
}

module.exports = NativeDBClient;
