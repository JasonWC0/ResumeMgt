/**
 * FeaturePath: Common-Repository--常用名稱
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: commonly-used-name-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-08 03:16:19 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongoose').Types;
const {
  LOGGER, models, codes, tools,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { CommonlyUsedNameEntity, modelCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new CommonlyUsedNameEntity().bindDBObjectId(doc).bindObjectId(doc._id.toString());
  return entity;
}

class CommonlyUsedNameRepository {
  /**
   * @param {String} companyId
   * @param {Array} type
   * @returns {Promise.<CommonlyUsedNameEntity>} return CommonlyUsedNameEntity json data
   */
  static async findByCompanyId(companyId, type = []) {
    const col = DefaultDBClient.getCollection(modelCodes.COMMONLYUSEDNAME);
    if (!ObjectId.isValid(companyId)) { return undefined; }
    const query = {
      companyId: ObjectId(companyId),
      valid: true,
    };
    if (tools.CustomValidator.nonEmptyArray(type)) {
      query.type = { $in: type };
    }

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

  static async updateByCompanyId(companyId, type, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.COMMONLYUSEDNAME);
    if (!ObjectId.isValid(companyId)) { return undefined; }
    const query = {
      companyId: ObjectId(companyId),
      type,
      valid: true,
    };

    const obj = {
      name: entity.name,
      __cc: entity.__cc,
      __sc: entity.__sc,
    };
    if (ObjectId.isValid(entity.creator)) {
      obj.creator = ObjectId(entity.creator);
    }
    if (ObjectId.isValid(entity.modifier)) {
      obj.modifier = ObjectId(entity.modifier);
    }

    try {
      const res = await col.findOneAndUpdate(query, { $set: obj, $inc: { __vn: 1 } }, { upsert: true, new: true });
      entity._id = res._id.toString();

      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = CommonlyUsedNameRepository;
