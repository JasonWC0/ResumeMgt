/**
 * FeaturePath: Common-Repository--個案服務狀態
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
  tools,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { modelCodes, CaseStatusHistoryEntity } = require('../../domain');

/**
 * Transform to CaseStatusHistoryEntity
 * @param {Object} doc db object
 * @returns CaseStatusHistoryEntity
 */
function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  return new CaseStatusHistoryEntity()
    .DBbind(tools.CustomUtils.convertId(doc))
    .bindObjectId(doc._id.toString());
}

class CaseStatusHistoryRepository {
  /**
   * Create CaseStatusHistory
   * @param {CaseStatusHistoryEntity} entity
   * @returns {Promise.<CaseStatusHistoryEntity>} return CaseStatusHistoryEntity
   */
  static async create(entity, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.CASESTATUSHISTORY);
    const obj = {
      caseId: ObjectId(entity.caseId),
      hc: entity.hc,
      dc: entity.dc,
      rc: entity.rc,
      valid: true,
      __vn: 0,
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
      const res = await col.create([obj], { session });
      return entity.bindObjectId(res[0]._id.toString());
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Update CaseStatusHistory
   * @param {CaseStatusHistoryEntity} entity
   * @returns {Promise.<CaseStatusHistoryEntity>} return CaseStatusHistoryEntity
   */
  static async updateByCaseId(entity, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.CASESTATUSHISTORY);
    const obj = {
      hc: entity.hc,
      dc: entity.dc,
      rc: entity.rc,
      __cc: entity.__cc,
      __sc: entity.__sc,
    };
    if (ObjectId.isValid(entity.modifier)) {
      obj.creator = ObjectId(entity.modifier);
    }

    try {
      const res = await col.updateOne({ caseId: ObjectId(entity.caseId) }, { $set: obj, $inc: { __vn: 1 } }, { session });
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
   * Find one case status history info.
   * @param {String} caseId Case id
   * @returns {Promise.<CaseStatusHistoryEntity>} return CaseStatusHistoryEntity
   */
  static async findByCaseId(caseId = '') {
    const col = DefaultDBClient.getCollection(modelCodes.CASESTATUSHISTORY);
    if (!ObjectId.isValid(caseId)) {
      return undefined;
    }

    const query = {
      caseId: ObjectId(caseId),
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
   * Update case status history's record
   * @param {String} caseId case id
   * @param {String} service 服務類型
   * @param {CaseServiceStatusRecordObject} record 個案狀態紀錄
   * @param {Object} baseInfo request baseInfo
   * @param {String} modifier 編輯者的personId
   * @returns Object
   */
  static async updateStatusRecord(caseId, service, record, baseInfo = {}, modifier = '', session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.CASESTATUSHISTORY);
    const query = {
      caseId: ObjectId(caseId),
      valid: true,
    };
    query[`${service}._id`] = ObjectId(record.id);

    const obj = {
      __cc: baseInfo.__cc,
      __sc: baseInfo.__sc,
    };
    obj[`${service}.$`] = {
      ...record,
      updatedAt: new Date(),
    };
    if (ObjectId.isValid(modifier)) {
      obj.modifier = ObjectId(modifier);
    }

    try {
      delete obj.__vn;
      const res = await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } }, { session });
      if (!tools.CustomValidator.isEqual(res.nModified, 1)) { return false; }
      return obj;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Delete case status history's record
   * @param {String} caseId case id
   * @param {String} service 服務類型
   * @param {String} recordId 個案狀態紀錄 id
   * @param {Object} baseInfo request baseInfo
   * @param {String} modifier 編輯者的personId
   * @returns Object
   */
  static async deleteStatusRecord(caseId, service, recordId, baseInfo = {}, modifier = '') {
    const col = DefaultDBClient.getCollection(modelCodes.CASESTATUSHISTORY);
    const query = {
      caseId: ObjectId(caseId),
      valid: true,
    };
    const pullObj = {};
    pullObj[service] = { _id: ObjectId(recordId) };
    const obj = {
      __cc: baseInfo.__cc,
      __sc: baseInfo.__sc,
    };
    if (ObjectId.isValid(modifier)) {
      obj.modifier = ObjectId(modifier);
    }

    try {
      delete obj.__vn;
      const res = await col.updateOne(query, { $pull: pullObj, $set: obj, $inc: { __vn: 1 } });
      if (!tools.CustomValidator.isEqual(res.nModified, 1)) { return false; }
      return obj;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = CaseStatusHistoryRepository;
