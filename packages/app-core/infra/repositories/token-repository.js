/**
 * FeaturePath: Common-Repository--Token
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: token-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-24 02:51:39 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongoose').Types;
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { modelCodes, TokenEntity } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  return new TokenEntity().bindDB(doc);
}

class TokenRepository {
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.TOKEN);
    const obj = {
      token: entity.token,
      accountId: ObjectId(entity.accountId),
      corpId: ObjectId(entity.corpId),
      account: entity.account,
      keycloakId: entity.keycloakId,
      personId: ObjectId(entity.personId),
      name: entity.name,
      companies: entity.companies,
    };

    try {
      const res = await col.create(obj);
      entity.bindObjectId(res._id.toString());
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findByToken(token) {
    const col = DefaultDBClient.getCollection(modelCodes.TOKEN);
    try {
      const res = await col.findOneAndUpdate({ token }, { updatedAt: new Date() }).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async update(qbe, obj, opt = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.TOKEN);
    try {
      const res = await col.updateMany(qbe, { $set: obj }, opt).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async deleteByToken(token) {
    const col = DefaultDBClient.getCollection(modelCodes.TOKEN);
    try {
      const res = await col.deleteOne({ token });
      return res;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = TokenRepository;
