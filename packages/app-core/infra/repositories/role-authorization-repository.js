/* eslint-disable consistent-return */
/**
 * FeaturePath: Common-Repository--機構員工角色
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: role-authorization-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-18 11:10:31 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongoose').Types;
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { RoleAuthorizationEntity, modelCodes } = require('../../domain');
const commonDelete = require('./common-function/delete');

const CUSTOM_MIN_ROLE = 1000;

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new RoleAuthorizationEntity().bindDB(doc).bindObjectId(doc._id.toString());
  return entity;
}

class RoleAuthorizationRepository {
  /**
   * @param {RoleAuthorizationEntity} entity
   * @returns {Promise.<RoleAuthorizationEntity>} return RoleAuthorizationEntity
   */
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
    if (!ObjectId.isValid(entity.companyId)) { return undefined; }
    const obj = {
      companyId: ObjectId(entity.companyId),
      role: entity.role,
      name: entity.name,
      manageAuthLevel: entity.manageAuthLevel,
      pageAuth: entity.pageAuth,
      reportAuth: entity.reportAuth,
      isDefault: entity.isDefault,
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
   *
   * @param {Promise.<RoleAuthorizationEntity>[]} entities
   * @returns {Promise.<RoleAuthorizationEntity>[]} return RoleAuthorizationEntity[]
   */
  static async createMulti(entities) {
    const col = DefaultDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
    entities.forEach((entity) => { if (!ObjectId.isValid(entity.companyId)) { return undefined; } });
    const obj = entities.map((entity) => ({
      companyId: ObjectId(entity.companyId),
      role: entity.role,
      name: entity.name,
      manageAuthLevel: entity.manageAuthLevel,
      pageAuth: entity.pageAuth,
      reportAuth: entity.reportAuth,
      isDefault: entity.isDefault,
      __cc: entity.__cc,
      __vn: entity.__vn,
      __sc: entity.__sc,
      valid: true,
    }));

    try {
      const resList = await col.create(obj);
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
   * @param {String} id _id
   * @param {RoleAuthorizationEntity} entity
   * @returns {Promise.<RoleAuthorizationEntity>} return RoleAuthorizationEntity
   */
  static async updateById(id, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
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
   * @returns {Promise.<RoleAuthorizationEntity>} return RoleAuthorizationEntity
   */
  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
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
   * @param {String} _companyId companyId._id
   * @returns {Promise.<RoleAuthorizationEntity>[]} return RoleAuthorizationEntity[]
   */
  static async findByCompany(_companyId) {
    const col = DefaultDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
    if (!ObjectId.isValid(_companyId)) { return undefined; }

    const query = {
      companyId: ObjectId(_companyId),
      valid: true,
    };

    try {
      const resList = await col.find(query).sort({ role: 1 }).lean();
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
   * @param {String} id _id
   * @returns {Boolean} return boolean
   */
  static async delete(id, baseInfo = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);
    const res = await commonDelete.deleteById(col, id, baseInfo.__cc, baseInfo.__sc);
    return res;
  }

  /**
   * @returns {Number} return role number
   */
  static async generateRoleNumber() {
    const col = DefaultDBClient.getCollection(modelCodes.ROLEAUTHORIZATION);

    const query = {
      role: {
        $gte: CUSTOM_MIN_ROLE,
      },
    };

    try {
      const res = await col.findOne(query).sort({ role: -1 }).lean();
      let value = CUSTOM_MIN_ROLE;
      if (res) {
        const { role } = res;
        value = role + 1;
      }
      return value;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = RoleAuthorizationRepository;
