/**
 * FeaturePath: Common-Repository--集團總公司
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: corporation-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-02-23 01:58:00 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongoose').Types;
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { CorporationEntity, modelCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  return new CorporationEntity().bind(doc).bindObjectId(doc._id.toString());
}

class CorporationRepository {
  /**
   * Create one corporation doc.
   * @param {CorporationEntity} entity json of corporation data
   * @returns {Promise.<CorporationEntity>} return CorporationEntity json data
   */
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.CORPORATION);
    const obj = {
      fullName: entity.fullName,
      shortName: entity.shortName,
      code: entity.code,
      __enc: entity.__enc,
      __cc: entity.__cc,
      __vn: entity.__vn,
      __sc: entity.__sc,
      valid: true,
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

  /**
   * Update one corporation doc.
   * @param {CorporationEntity} entity json of corporation data
   * @returns {Promise.<CorporationEntity>} return CorporationEntity json data
   */
  static async update(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.CORPORATION);
    const obj = {
      fullName: entity.fullName,
      shortName: entity.shortName,
      code: entity.code,
      __enc: entity.__enc,
      valid: entity.valid,
      __cc: entity.__cc,
      __sc: entity.__sc,
    };

    try {
      const res = await col.updateOne({ _id: entity.id }, { $set: obj, $inc: { __vn: 1 } });
      entity.bindObjectId(res._id);
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Find one corporation doc. by ObjectId
   * @param {string} id DB ObjectId
   * @returns {Promise.<CorporationEntity>} return CorporationEntity json data
   */
  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.CORPORATION);
    if (!ObjectId.isValid(id)) { return undefined; }

    try {
      const res = await col.findById(id).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Find one corporation doc by shortName.
   * @param {string} shortName corporation name
   * @returns {Promise.<CorporationEntity>} return CorporationEntity json data
   */
  static async findByShortname(shortName = '') {
    const col = DefaultDBClient.getCollection(modelCodes.CORPORATION);

    try {
      const res = await col.findOne({ shortName }).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Find one corporation doc by code.
   * @param {string} code corporation code
   * @returns {Promise.<CorporationEntity>} return CorporationEntity json data
   */
  static async findByCode(code = '') {
    const col = DefaultDBClient.getCollection(modelCodes.CORPORATION);

    try {
      const res = await col.findOne({ code }).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = CorporationRepository;
