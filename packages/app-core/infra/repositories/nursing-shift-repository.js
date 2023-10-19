/**
 * FeaturePath: Common-Repository--護理班別
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: nursing-shift-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-13 03:45:38 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongoose').Types;
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { NursingShiftEntity, modelCodes } = require('../../domain');
const commonDelete = require('./common-function/delete');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new NursingShiftEntity().bindDBObjectId(doc).bindObjectId(doc._id.toString());
  return entity;
}

class NursingShiftRepository {
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.NURSINGSHIFT);
    if (!ObjectId.isValid(entity.companyId)) { throw new models.CustomError(codes.errorCodes.ERR_FIELD_OBJECT_ID_WRONG_FORMAT); }

    const obj = {
      companyId: ObjectId(entity.companyId),
      code: entity.code,
      name: entity.name,
      startedAt: entity.startedAt,
      endedAt: entity.endedAt,
      detail: entity.detail,
      isDayOff: entity.isDayOff,
      __vn: 0,
      __cc: entity.__cc,
      __sc: entity.__sc,
      valid: true,
    };
    if (ObjectId.isValid(entity.creator)) {
      obj.creator = ObjectId(entity.creator);
    }
    if (ObjectId.isValid(entity.modifier)) {
      obj.modifier = ObjectId(entity.modifier);
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

  static async updateById(id, entity, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.NURSINGSHIFT);
    const query = {
      _id: ObjectId(id),
      valid: true,
    };
    const obj = {
      code: entity.code,
      name: entity.name,
      startedAt: entity.startedAt,
      endedAt: entity.endedAt,
      detail: entity.detail,
      isDayOff: entity.isDayOff,
      __cc: entity.__cc,
      __sc: entity.__sc,
    };
    if (ObjectId.isValid(entity.modifier)) {
      obj.modifier = ObjectId(entity.modifier);
    }

    try {
      const res = await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } }, { session });
      if (res.n !== 1 && res.nModified !== 1) {
        throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
      }
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.NURSINGSHIFT);
    if (!ObjectId.isValid(id)) { return undefined; }
    const query = {
      _id: ObjectId(id),
      valid: true,
    };

    try {
      const res = await col.findOne(query).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findByCompanyId(companyId, f = true) {
    const col = DefaultDBClient.getCollection(modelCodes.NURSINGSHIFT);
    const query = {
      companyId: ObjectId(companyId),
      valid: true,
    };
    if (!f) {
      query.isDayOff = false;
    }

    try {
      const resList = await col.find(query).sort({ startedAt: 1, endedAt: 1 }).lean();
      if (!resList) { return undefined; }

      const resArray = [];
      for (const res of resList) {
        resArray.push(_transform(res));
      }
      return resArray;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findByQbe(qbe = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.NURSINGSHIFT);
    const query = {};
    if (CustomValidator.nonEmptyString(qbe.companyId) && ObjectId.isValid(qbe.companyId)) {
      query.companyId = ObjectId(qbe.companyId);
    }
    query.valid = true;
    if (CustomValidator.nonEmptyString(qbe.code)) {
      query.code = qbe.code;
    }

    try {
      const resList = await col.find(query).lean();
      if (!resList) { return undefined; }

      const resArray = [];
      for (const res of resList) {
        resArray.push(_transform(res));
      }
      return resArray;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async deleteById(id, baseInfo = {}, modifier = '', session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.NURSINGSHIFT);
    const res = await commonDelete.deleteById(col, id, baseInfo.__cc, baseInfo.__sc, modifier, session);
    return res;
  }
}

module.exports = NursingShiftRepository;
