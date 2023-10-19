/**
 * FeaturePath: Common-Repository-Base-DeleteFunction
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: delete.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-15 06:51:38 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongoose').Types;
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { coreErrorCodes } = require('../../../domain');

async function _deleteById(collection, id, __cc, __sc, modifier = '', session = null) {
  if (!ObjectId.isValid(id)) { throw new models.CustomError(coreErrorCodes.ERR_DELETE_ID_WRONG_FORMAT); }

  const query = { _id: ObjectId(id), valid: true };
  const obj = {
    valid: false,
    __cc,
    __sc,
  };
  if (ObjectId.isValid(modifier)) {
    obj.modifier = ObjectId(modifier);
  }

  try {
    const res = await collection.updateOne(query, { $set: obj, $inc: { __vn: 1 } }, { session });
    if (res.n !== 1 && res.nModified !== 1) {
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
    return true;
  } catch (ex) {
    LOGGER.error(ex.stack);
    throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
  }
}

module.exports = {
  deleteById: _deleteById,
};
