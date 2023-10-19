/**
 * FeaturePath: 通用主系統-通用子系統-連線模組-Session
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: session-mongodb.js
 * Project: @erpv3/app-common
 * File Created: 2022-02-08 10:16:00 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { Schema } = require('mongoose');

const schema = {
  _id: String,
  data: Object,
  updatedAt: {
    default: new Date(),
    expires: 86400, // 1 day
    type: Date,
  },
};

class MongooseStore {
  constructor({
    collection = 'sessions',
    connection = null,
    expires = 86400,
    name = 'Session',
  } = {}) {
    if (!connection) {
      throw new Error('Session db connection can not be empty');
    }
    const updatedAt = { ...schema.updatedAt, expires };
    this.session = connection.model(
      name,
      new Schema({ ...schema, updatedAt }),
      collection
    );
    this.session.syncIndexes();
  }

  async destroy(id) {
    const { session } = this;
    return session.deleteOne({ _id: id });
  }

  async get(id) {
    const { session } = this;
    const { data } = (await session.findById(id)) || {};
    return data;
  }

  async set(id, data, maxAge, { changed, rolling }) {
    if (changed || rolling) {
      const { session } = this;
      const record = { _id: id, data, updatedAt: new Date() };
      await session.findByIdAndUpdate(id, record, { upsert: true, safe: true });
    }
    return data;
  }

  static create(opts) {
    return new MongooseStore(opts);
  }
}

module.exports = MongooseStore;
