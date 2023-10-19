/**
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設角色(新增員工角色)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設角色(編輯員工角色)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設角色(檢視員工角色)
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: role-default-service-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-12 10:12:23 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongoose').Types;
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { RoleDefaultServiceEntity, modelCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new RoleDefaultServiceEntity().bindDB(doc).bindObjectId(doc._id.toString());
  return entity;
}

class RoleDefaultServiceRepository {
  /**
   * @param {RoleDefaultServiceEntity} entity
   * @returns {Promise.<RoleDefaultServiceEntity>} return RoleDefaultServiceEntity
   */
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.ROLEDEFAULTSERVICE);
    if (!ObjectId.isValid(entity.serviceGroupId)) { return undefined; }
    const obj = {
      serviceGroupId: ObjectId(entity.serviceGroupId),
      role: entity.role,
      name: entity.name,
      pageAuth: entity.pageAuth,
      reportAuth: entity.reportAuth,
      manageAuthLevel: entity.manageAuthLevel,
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
   * @param {String} id _id
   * @param {RoleDefaultServiceEntity} entity
   * @returns {Promise.<RoleDefaultServiceEntity>} return RoleDefaultServiceEntity
   */
  static async updateById(id, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.ROLEDEFAULTSERVICE);
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
   * @returns {Promise.<RoleDefaultServiceEntity>} return RoleDefaultServiceEntity
   */
  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.ROLEDEFAULTSERVICE);
    if (!ObjectId.isValid(id)) { return undefined; }

    const query = {
      _id: ObjectId(id),
      valid: true,
    };

    try {
      const res = await col.findOne(query).populate('serviceGroupId').lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @returns {Promise.<RoleDefaultServiceEntity>[]} return RoleDefaultServiceEntity[]
   */
  static async findAll() {
    const col = DefaultDBClient.getCollection(modelCodes.ROLEDEFAULTSERVICE);

    try {
      const resList = await col.find({ valid: true }).sort({ serviceGroupId: 1, role: 1 }).populate('serviceGroupId').lean();
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

  static async findByServiceGroupId(id) {
    const col = DefaultDBClient.getCollection(modelCodes.ROLEDEFAULTSERVICE);
    if (!ObjectId.isValid(id)) { return undefined; }

    const query = {
      serviceGroupId: ObjectId(id),
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
}

module.exports = RoleDefaultServiceRepository;
