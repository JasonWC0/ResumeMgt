/**
 * FeaturePath: Common-Model--Version
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: version.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-27 05:54:14 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { Schema } = require('mongoose');
const { modelCodes } = require('../../domain');

const _schema = new Schema(
  {
    // version
    version: {
      type: String,
      trim: true,
    },
    // collection name
    colName: {
      type: String,
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.VERSION}s`,
  }
);
module.exports = {
  modelName: modelCodes.VERSION,
  schema: _schema,
};
