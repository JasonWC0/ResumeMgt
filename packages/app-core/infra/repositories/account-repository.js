/**
 * FeaturePath: Common-Repository--帳號
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: account-repository.js
 * Project: @erpv3/app-person
 * File Created: 2022-02-08 03:50:45 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongoose').Types;
const {
  LOGGER, models, codes, tools,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { AccountEntity, modelCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new AccountEntity().bindDBObjectId(doc).bindObjectId(doc._id.toString());
  return entity;
}

class AccountRepository {
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.ACCOUNT);
    if (!ObjectId.isValid(entity.corpId)) { return undefined; }
    if (!ObjectId.isValid(entity.personId)) { return undefined; }
    const obj = {
      corpId: ObjectId(entity.corpId),
      personId: ObjectId(entity.personId),
      type: entity.type,
      account: entity.account,
      keycloakId: entity.keycloakId,
      companyAdmin: entity.companyAdmin,
      __cc: entity.__cc,
      __vn: entity.__vn,
      __sc: entity.__sc,
      valid: true,
    };
    if (tools.CustomValidator.nonEmptyString(entity.id)) {
      if (!ObjectId.isValid(entity.id)) { return undefined; }
      obj._id = ObjectId(entity.id);
    }

    try {
      const res = await col.create(obj);
      entity.bindObjectId(res._id.toString());
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.ACCOUNT);
    if (!ObjectId.isValid(id)) { return undefined; }

    try {
      const res = await col.findById(id).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findByAccount(account) {
    const col = DefaultDBClient.getCollection(modelCodes.ACCOUNT);
    const query = { account, valid: true };

    try {
      const res = await col.findOne(query).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findByCorpAndPerson(_corpId, _personId, type) {
    const col = DefaultDBClient.getCollection(modelCodes.ACCOUNT);
    const query = {
      corpId: ObjectId(_corpId),
      personId: ObjectId(_personId),
      type,
      valid: true,
    };

    try {
      const accountRes = await col.findOne(query).lean();
      return _transform(accountRes);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findByCorp(_corpId) {
    const col = DefaultDBClient.getCollection(modelCodes.ACCOUNT);
    const query = {
      corpId: ObjectId(_corpId),
    };

    try {
      const resList = await col.find(query).lean();
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

  static async findCompanyAdmin() {
    const col = DefaultDBClient.getCollection(modelCodes.ACCOUNT);
    const query = {
      type: 0,
      companyAdmin: true,
      valid: true,
    };

    try {
      const resList = await col.find(query).populate('personId').lean();

      const resArray = [];
      for (const account of resList) {
        resArray.push(_transform(account));
      }
      return resArray;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async updateById(id, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.ACCOUNT);
    if (!ObjectId.isValid(id)) { return undefined; }
    if (!ObjectId.isValid(entity.corpId)) { return undefined; }

    const query = { _id: ObjectId(id) };
    const obj = {
      corpId: ObjectId(entity.corpId),
      account: entity.account,
      keycloakId: entity.keycloakId,
      type: entity.type,
      companyAdmin: entity.companyAdmin,
      __cc: entity.__cc,
      __sc: entity.__sc,
    };

    try {
      const res = await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } });
      if (!tools.CustomValidator.isEqual(res.nModified, 1)) { return false; }
      return true;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async delete(account, basicInfo = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.ACCOUNT);
    const query = { account };
    const obj = {
      valid: false,
      __cc: basicInfo.__cc,
      __sc: basicInfo.__sc,
    };

    try {
      const res = await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } });
      if (!tools.CustomValidator.isEqual(res.nModified, 1)) { return false; }
      return true;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async permanentlyDelete(_corpId) {
    const col = DefaultDBClient.getCollection(modelCodes.ACCOUNT);
    const query = { corpId: ObjectId(_corpId) };
    try {
      await col.deleteMany(query);
      return true;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findAll() {
    const col = DefaultDBClient.getCollection(modelCodes.ACCOUNT);
    const query = {
      valid: true,
    };

    try {
      const resList = await col.find(query).lean();

      const resArray = [];
      for (const account of resList) {
        resArray.push(_transform(account));
      }
      return resArray;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = AccountRepository;
