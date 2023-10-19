/**
 * FeaturePath: Common-Repository--表單範本
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-07 01:53:09 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongoose').Types;
const {
  LOGGER, models, codes, tools,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { FormEntity, modelCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new FormEntity().bindDB(doc).bindObjectId(doc._id.toString());
  return entity;
}

class FormRepository {
  /**
   * @param {FormEntity} entity
   * @param {Boolean} throwError
   * @returns {Promise.<FormEntity>} return FormEntity
   */
  static async createOne(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.FORM);
    if (tools.CustomValidator.nonEmptyArray(entity.signatures)) {
      entity.signatures.forEach((v) => ObjectId(v));
    }
    const obj = {
      internalCode: entity.internalCode,
      clientDomain: entity.clientDomain,
      companyId: ObjectId(entity.companyId),
      serviceTypes: entity.serviceTypes,
      category: entity.category,
      type: entity.type,
      version: entity.version,
      name: entity.name,
      reviewType: entity.reviewType,
      reviewRoles: entity.reviewRoles,
      frequency: entity.frequency,
      displayGroup: entity.displayGroup,
      fillRoles: entity.fillRoles,
      viewRoles: entity.viewRoles,
      signatures: entity.signatures,
      inUse: true,
      __cc: entity.__cc,
      __vn: entity.__vn,
      __sc: entity.__sc,
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

  static async createMulti(entities) {
    const col = DefaultDBClient.getCollection(modelCodes.FORM);
    const obj = entities.map((entity) => {
      if (tools.CustomValidator.nonEmptyArray(entity.signatures)) {
        entity.signatures.forEach((v) => ObjectId(v));
      }
      return {
        internalCode: entity.internalCode,
        clientDomain: entity.clientDomain,
        companyId: ObjectId(entity.companyId),
        serviceTypes: entity.serviceTypes,
        category: entity.category,
        type: entity.type,
        version: entity.version,
        name: entity.name,
        reviewType: entity.reviewType,
        reviewRoles: entity.reviewRoles,
        frequency: entity.frequency,
        displayGroup: entity.displayGroup,
        fillRoles: entity.fillRoles,
        viewRoles: entity.viewRoles,
        signatures: entity.signatures,
        inUse: true,
        __cc: entity.__cc,
        __vn: entity.__vn,
        __sc: entity.__sc,
      };
    });
    try {
      await col.create(obj);
      return entities;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @param {String} id _id
   * @returns {Promise.<FormEntity>} return FormEntity
   */
  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.FORM);
    if (!ObjectId.isValid(id)) { return undefined; }

    try {
      const res = await col.findById(id).populate('signatures').lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @param {String} companyId
   * @param {Object} qbe
   * @param {Array} qbe.category 表單主類別
   * @param {Array} qbe.serviceType 服務類型
   * @param {Boolean} qbe.hasFrequency 是否有頻率
   * @param {Boolean} qbe.inUse 是否使用中
   * @param {Boolean} qbe.valid
   *@returns {Promise.<FormEntity>[]} return FormEntity[]
   */
  static async findByCompany(_companyId, qbe = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.FORM);
    if (!ObjectId.isValid(_companyId)) { return []; }

    const query = {
      companyId: ObjectId(_companyId),
    };
    if (tools.CustomValidator.isBoolean(qbe.inUse)) {
      query.inUse = qbe.inUse;
    }
    if (tools.CustomValidator.isBoolean(qbe.valid)) {
      query.valid = qbe.valid;
    }
    if (tools.CustomValidator.nonEmptyArray(qbe.category)) {
      query.category = { $in: qbe.category };
    }
    if (tools.CustomValidator.nonEmptyArray(qbe.serviceType)) {
      query.serviceTypes = { $in: qbe.serviceType };
    }
    if (tools.CustomValidator.isBoolean(qbe.hasFrequency)) {
      if (qbe.hasFrequency) {
        query.$and = [
          { frequency: { $exists: true } },
          { frequency: { $nin: [null, ''] } }
        ];
      } else {
        query.$or = [
          { frequency: { $exists: false } },
          { frequency: { $in: [null, ''] } }
        ];
      }
    }

    try {
      const res = await col.find(query).populate('signatures').lean();
      if (!res) {
        return undefined;
      }

      const resArray = [];
      for (const f of res) {
        resArray.push(_transform(f));
      }
      return resArray;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findOne(query) {
    const col = DefaultDBClient.getCollection(modelCodes.FORM);
    if (query.companyId) { query.companyId = ObjectId(query.companyId); }

    try {
      const res = await col.findOne(query).populate('signatures').lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @param {String} id _id
   * @returns {Promise.<FormEntity>} return FormEntity
   */
  static async updateById(id, entity, admin = false) {
    const col = DefaultDBClient.getCollection(modelCodes.FORM);
    if (!ObjectId.isValid(id)) { return undefined; }
    const query = {
      _id: ObjectId(id),
    };

    if (tools.CustomValidator.nonEmptyArray(entity.signatures)) {
      entity.signatures.forEach((v) => ObjectId(v));
    }
    const obj = {
      serviceTypes: entity.serviceTypes,
      name: entity.name,
      reviewType: entity.reviewType,
      reviewRoles: entity.reviewRoles,
      frequency: entity.frequency,
      displayGroup: entity.displayGroup,
      fillRoles: entity.fillRoles,
      viewRoles: entity.viewRoles,
      signatures: entity.signatures,
      __cc: entity.__cc,
      __sc: entity.__sc,
    };
    if (admin) {
      obj.internalCode = entity.internalCode;
      obj.clientDomain = entity.clientDomain;
      obj.__vn = entity.__vn;
    }

    try {
      let res;
      if (tools.CustomValidator.isNumber(obj.__vn)) {
        res = await col.updateOne(query, { $set: obj });
      } else {
        res = await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } });
      }

      if (res.n !== 1 && res.nModified !== 1) {
        throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
      }
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async noUseById(id, basicInfo) {
    const col = DefaultDBClient.getCollection(modelCodes.FORM);
    if (!ObjectId.isValid(id)) { return undefined; }
    const query = {
      _id: ObjectId(id),
    };
    const obj = {
      inUse: false,
      __cc: basicInfo.__cc,
      __sc: basicInfo.__sc,
    };
    try {
      const res = await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } });
      if (res.n !== 1 && res.nModified !== 1) {
        throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
      }
      return true;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = FormRepository;
