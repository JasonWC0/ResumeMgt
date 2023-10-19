/**
 * FeaturePath: Common-Repository--銀行資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: bank-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-27 01:48:18 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { LOGGER, models, codes } = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { BankEntity, modelCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new BankEntity().bind(doc).bindObjectId(doc._id.toString());
  return entity;
}

class BankRepository {
  static async findAll() {
    const col = DefaultDBClient.getCollection(modelCodes.BANK);
    const query = {
      valid: true,
    };

    try {
      const resList = await col.find(query).sort({ code: 1 }).lean();
      const resArray = [];
      for (const data of resList) {
        resArray.push(_transform(data));
      }
      return resArray;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = BankRepository;
