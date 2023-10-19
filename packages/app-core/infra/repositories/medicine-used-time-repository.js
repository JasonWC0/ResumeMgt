/**
 * FeaturePath: Common-Repository--機構常用藥時間
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-used-time-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-08 11:58:58 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongoose').Types;
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { MedicineUsedTimeEntity, modelCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new MedicineUsedTimeEntity().bindDBObjectId(doc).bindObjectId(doc._id.toString());
  return entity;
}

class MedicineUsedTimeRepository {
  /**
   * @param {String} companyId
   * @returns {Promise.<MedicineUsedTimeEntity>} return MedicineUsedTimeEntity json data
   */
  static async findByCompanyId(companyId) {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINEUSEDTIME);
    if (!ObjectId.isValid(companyId)) { return undefined; }
    const query = {
      companyId: ObjectId(companyId),
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

  /**
   * @param {String} companyId
   * @param {MedicineUsedTimeEntity} entity
   * @returns {Promise.<MedicineUsedTimeEntity>} return MedicineUsedTimeEntity json data
   */
  static async updateByCompanyId(companyId, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINEUSEDTIME);
    if (!ObjectId.isValid(companyId)) { return undefined; }
    const query = {
      companyId: ObjectId(companyId),
      valid: true,
    };

    const obj = {
      beforeBreakfast: entity.beforeBreakfast,
      afterBreakfast: entity.afterBreakfast,
      beforeLunch: entity.beforeLunch,
      afterLunch: entity.afterLunch,
      beforeDinner: entity.beforeDinner,
      afterDinner: entity.afterDinner,
      beforeBedtime: entity.beforeBedtime,
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

module.exports = MedicineUsedTimeRepository;
