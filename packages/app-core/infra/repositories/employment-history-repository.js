/**
 * FeaturePath: Common-Repository--員工到職紀錄
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { ObjectId } = require('mongoose').Types;
const {
  LOGGER,
  models,
  codes,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { EmploymentHistoryEntity, modelCodes } = require('../../domain');
const commonDelete = require('./common-function/delete');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  return new EmploymentHistoryEntity()
    .bind(doc)
    .bindObjectId(doc._id.toString())
    .withCompanyId(doc.companyId.toString());
}

class employmentHistoryRepository {
  /**
 * @param {EmploymentHistoryEntity} entity
 * @returns {Promise.<EmploymentHistoryEntity>} return EmploymentHistoryEntity
 */
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.EMPLOYMENTHISTORY);
    if (!ObjectId.isValid(entity.companyId)) { return undefined; }
    if (!ObjectId.isValid(entity.personId)) { return undefined; }
    const obj = {
      companyId: ObjectId(entity.companyId),
      personId: ObjectId(entity.personId),
      date: entity.date,
      status: entity.status,
      __cc: entity.__cc,
      __vn: 0,
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
   * @param {EmploymentHistoryEntity} entity
   * @returns {Promise.<EmploymentHistoryEntity>} return EmploymentHistoryEntity
   */
  static async updateById(id, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.EMPLOYMENTHISTORY);
    if (!ObjectId.isValid(id)) { return undefined; }

    const query = {
      _id: ObjectId(id),
      valid: true,
    };
    const obj = {
      date: entity.date,
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

  static async deleteById(id, baseInfo = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.EMPLOYMENTHISTORY);
    const res = await commonDelete.deleteById(col, id, baseInfo.__cc, baseInfo.__sc);
    return res;
  }

  /**
 * @param {String} employmentHistoryId employmentHistoryId
 * @returns {Promise.<EmploymentHistoryEntity>} return EmploymentHistoryEntity
 */
  static async findById(employmentHistoryId = '') {
    if (!ObjectId.isValid(employmentHistoryId)) { return undefined; }
    const col = DefaultDBClient.getCollection(modelCodes.EMPLOYMENTHISTORY);
    try {
      const res = await col.findOne({
        _id: ObjectId(employmentHistoryId),
        valid: true,
      }).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @param {String} companyId companyId
   * @param {String} personalId personalId
   * @returns {Promise.<EmploymentHistoryEntity>} return EmploymentHistoryEntity
   */
  static async findList(companyId = '', personalId = '', sort = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.EMPLOYMENTHISTORY);
    try {
      const resList = await col.find({
        companyId: ObjectId(companyId),
        personId: ObjectId(personalId),
        valid: true,
      }).sort(sort).lean();
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

module.exports = employmentHistoryRepository;
