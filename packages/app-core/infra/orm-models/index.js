/**
 * FeaturePath: Common-Model--列表
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: index.js
 * Project: @erpv3/app-core
 * File Created: 2022-02-08 01:41:09 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const fs = require('fs');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');

async function _load() {
  return new Promise((res, rej) => {
    fs.readdir(__dirname, { withFileTypes: true }, (err, files) => {
      if (err) {
        return rej(err);
      }
      const models = files
        .filter((x) => x.isFile())
        .map((x) => x.name)
        .filter((x) => !Object.is(x, 'index.js'));
      models.forEach((x) => {
        if (x.startsWith('.')) { return; }
        // eslint-disable-next-line import/no-dynamic-require
        const m = require(`./${x}`);
        DefaultDBClient.registerCollection(m.modelName, m.schema);
      });
      return res();
    });
  });
}
module.exports = {
  load: _load,
};
