/**
 * FeaturePath: Common-System--seeder
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: index.js
 * Project: @erpv3/backend
 * File Created: 2022-04-01 11:01:56 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const fs = require('fs');

const seeder = async () => {
  const files = fs.readdirSync(__dirname)
    .filter((x) => x.includes('seeder'));

  for await (const num of files) {
    // eslint-disable-next-line import/no-dynamic-require
    const x = require(`./${num}`);
    await x.checkUpdate();
  }
};

module.exports = {
  run: seeder,
};
