/**
 * FeaturePath: Common-System--
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: app-initializer.js
 * Project: @erpv3/backend
 * File Created: 2022-02-07 03:45:04 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const conf = require('@erpv3/app-common/shared/config');
const fs = require('fs-extra');
const path = require('path');
const { DefaultDBClient, NativeDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { customArgvs } = require('@erpv3/app-common/custom-tools');
const { LOGGER } = require('@erpv3/app-common');
const coreDoc = require('@erpv3/app-core/infra/orm-models');
const seeder = require('./configs/seeder');

const _TEST_ENV = ['localTest', 'test'];

/**
* @class
* @classdesc Describe app initializer
*/
class AppInitializer {
  /**
  * @static
  * @async
  * @description Try to create and connect to default database
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async tryDefaultDatabase(testStamp = null) {
    const def = { ...conf.DATABASES.DEFAULT_MONGO };

    if (_TEST_ENV.includes(customArgvs.env)) {
      if (testStamp === null) { throw Error('Need testStamp'); }

      def.DB_NAME = `${conf.DATABASES.DEFAULT_MONGO.DB_NAME}_${testStamp}`;
      def.URI = def.URI.replace(conf.DATABASES.DEFAULT_MONGO.DB_NAME, def.DB_NAME);
    }

    LOGGER.info(`Try to create default database, connect to ${def.URI}`);
    await DefaultDBClient.create(def.URI, {
      user: def.USER,
      pass: def.PASS,
      poolSize: def.POOL_SIZE,
      dbName: def.DB_NAME,
    });
    await Promise.all([
      coreDoc.load()
    ]);
    await DefaultDBClient.syncIndexes();
  }

  /**
   * Try to create native database
   */
  static async tryNativeDatabase(testStamp = null) {
    const def = { ...conf.DATABASES.DEFAULT_MONGO };
    if (_TEST_ENV.includes(customArgvs.env)) {
      if (testStamp === null) { throw Error('Need testStamp'); }

      def.DB_NAME = `${conf.DATABASES.DEFAULT_MONGO.DB_NAME}_${testStamp}`;
      def.URI = def.URI.replace(conf.DATABASES.DEFAULT_MONGO.DB_NAME, def.DB_NAME);
    }

    LOGGER.info(`Try to create native database, connect to ${def.URI}`);
    await NativeDBClient.create(def.URI, {
      auth: {
        username: def.USER,
        password: def.PASS,
      },
    }, def.DB_NAME);
  }

  /**
  * @static
  * @async
  * @description Try to create orgpic file
  * @returns {Promise.<void>} Promise.<void>
  * @throws {Error} error
  */
  static async tryDefaultFile() {
    LOGGER.info('ADD FILE', path.resolve(__dirname, '../../files'));
    const dir = path.resolve(__dirname, '../../files');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }

  static async runSeeder() {
    return seeder.run();
  }
}

module.exports = AppInitializer;
