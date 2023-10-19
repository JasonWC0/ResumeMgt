/**
 * Accountable: JoyceS Hsu, Wilbert Yang
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: native-db-client.js
 * Project: @erpv3/backend
 * File Created: 2022-02-14 11:26:43 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
const { MongoClient } = require('mongodb');

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
  static async create(uri, options, dbName) {
    if (!uri || uri === '') {
      throw new Error('Connect uri is empty');
    }
    _uri = uri;

    if (options && Object.keys(options).length > 0) {
      _defaultOptions = Object.assign({}, _defaultOptions, options);
    }

    const { auth } = _defaultOptions;
    if (auth) {
      const { username, password } = auth;
      if (!username || !password || username === '' || password === '') {
        delete _defaultOptions['auth'];
      }
    }

    _instance = new MongoClient(_uri, _defaultOptions);
    return NativeDBClient.tryConnect(dbName);
  }

  static tryConnect(dbName) {
    _conn = _instance.connect();
    _db = _instance.db(dbName);
    return _db;
  }

  /**
  * 
  * @param {string} name 
  * @returns {import('mongoose').Collection}
  */
  static getCollection(name) {
    if (!name || name === '') {
      throw new Error('Collection name is empty');
    }

    return _db.collection(name);
  }

  static async clearData() {
    const cols = await _db.collections();

    const tasks = [];
    for (const col of cols) {
      tasks.push(col.deleteMany());
    }
    await Promise.all(tasks);
  }

  static async close() {
    return _instance.close();
  }

  static async drop() {
    return _db.dropDatabase();
  }
}

module.exports = NativeDBClient;
