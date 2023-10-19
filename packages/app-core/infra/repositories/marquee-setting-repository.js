/**
 * FeaturePath: Common-Repository--跑馬燈設定
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: marquee-setting-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-09-13 10:59:11 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { ObjectId } = require('mongoose').Types;
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { MarqueeSettingEntity, modelCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new MarqueeSettingEntity().bindDBObjectId(doc).bindObjectId(doc._id.toString());
  return entity;
}

class MarqueeSettingRepository {
  /**
   * Create one marquee setting doc.
   * @param {MarqueeSettingEntity} entity json of marquee setting data
   * @returns {Promise.<MarqueeSettingEntity>} return MarqueeSettingEntity
   */
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.MARQUEESETTING);
    const obj = {
      companyId: ObjectId(entity.companyId),
      speed: entity.speed,
      contents: entity.contents,
      valid: true,
      __cc: entity.__cc,
      __vn: entity.__vn,
      __sc: entity.__sc,
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

  /**
   * Update marquee setting By companyId
   * @param {string} companyId
   * @param {MarqueeSettingEntity} entity
   * @returns {Promise.<MarqueeSettingEntity>} return MarqueeSettingEntity
   */
  static async updateByCompanyId(companyId, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.MARQUEESETTING);
    if (!ObjectId.isValid(companyId)) { return undefined; }
    const query = {
      companyId: ObjectId(companyId),
      valid: true,
    };

    const obj = {
      speed: entity.speed,
      contents: entity.contents,
      __cc: entity.__cc,
      __sc: entity.__sc,
    };
    if (ObjectId.isValid(entity.modifier)) {
      obj.modifier = ObjectId(entity.modifier);
    }

    try {
      const res = await col.findOneAndUpdate(query, { $set: obj, $inc: { __vn: 1 } });
      entity._id = res._id.toString();

      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Find marquee setting By companyId
   * @param {string} companyId
   * @returns {Promise.<MarqueeSettingEntity>} return MarqueeSettingEntity
   */
  static async findByCompanyId(companyId) {
    const col = DefaultDBClient.getCollection(modelCodes.MARQUEESETTING);
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
   * Delete
   * @param {string} companyId
   * @param {object} baseInfo { __cc, __sc }
   * @param {string} modifier modifier personId
   * @returns {boolean}
   */
  static async deleteByCompanyId(companyId, baseInfo = {}, modifier = '') {
    const col = DefaultDBClient.getCollection(modelCodes.MARQUEESETTING);
    if (!ObjectId.isValid(companyId)) { return undefined; }
    const query = {
      companyId: ObjectId(companyId),
      valid: true,
    };

    const obj = {
      __cc: baseInfo.__cc,
      __sc: baseInfo.__sc,
    };
    if (ObjectId.isValid(modifier)) {
      obj.modifier = ObjectId(modifier);
    }

    try {
      await col.findOneAndUpdate(query, { $set: obj, $inc: { __vn: 1 } });
      return true;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = MarqueeSettingRepository;
