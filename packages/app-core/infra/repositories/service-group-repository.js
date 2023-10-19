/**
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設功能(新增服務)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設功能(編輯服務)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設功能(檢視服務)
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: service-group-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-01 03:16:46 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongoose').Types;
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { ServiceGroupEntity, modelCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new ServiceGroupEntity().bind(doc).bindObjectId(doc._id.toString());
  return entity;
}

class ServiceDefaultFuncRepository {
  /**
   * @param {FormResultEntity} entity
   * @param {Boolean} throwError
   * @returns {Promise.<ServiceGroupEntity>} return ServiceGroupEntity
   */
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.SERVICEGROUP);
    const obj = {
      code: entity.code,
      name: entity.name,
      pageAuth: entity.pageAuth,
      reportAuth: entity.reportAuth,
      __cc: entity.__cc,
      __sc: entity.__sc,
      __vn: entity.__vn,
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
   * @param {String} id _id
   * @param {ServiceDefaultFuncEntity} entity
   * @returns {Promise.<ServiceDefaultFuncEntity>} return ServiceDefaultFuncEntity
   */
  static async updateById(id, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.SERVICEGROUP);
    if (!ObjectId.isValid(id)) { return undefined; }

    const query = {
      _id: ObjectId(id),
      valid: true,
    };
    const obj = {
      pageAuth: entity.pageAuth,
      reportAuth: entity.reportAuth,
      __cc: entity.__cc,
      __sc: entity.__sc,
    };

    try {
      const res = await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } });
      if (res.n !== 1 && res.nModified !== 1) {
        throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
      }
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @param {String} id _id
   * @returns {Promise.<ServiceDefaultFuncEntity>} return ServiceDefaultFuncEntity
   */
  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.SERVICEGROUP);
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

  /**
   * @returns {Promise.<ServiceDefaultFuncEntity>[]} return ServiceDefaultFuncEntity[]
   */
  static async findAll() {
    const col = DefaultDBClient.getCollection(modelCodes.SERVICEGROUP);

    try {
      const resList = await col.find({ valid: true }).lean();
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

  /**
   * @param {String} code
   * @returns {Promise.<ServiceDefaultFuncEntity>} return ServiceDefaultFuncEntity
   */
  static async findByCode(code) {
    const col = DefaultDBClient.getCollection(modelCodes.SERVICEGROUP);

    const query = {
      code,
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
}

module.exports = ServiceDefaultFuncRepository;
