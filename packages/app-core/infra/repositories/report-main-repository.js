/* eslint-disable consistent-return */
/**
 * FeaturePath: Common-Repository--報表
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: report-main-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-09-06 04:04:49 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { ObjectId } = require('mongoose').Types;
const { modelCodes, ReportMainEntity } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  return new ReportMainEntity()
    .bind(doc)
    .bindDBObjectId(doc)
    .bindObjectId(doc._id.toString());
}

class ReportMainRepository {
  /**
   * create report(main) data
   * @param {ReportMainEntity} entity
   */
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.REPORTMAIN);
    const obj = {
      companyId: ObjectId(entity.companyId),
      type: entity.type,
      year: entity.year,
      month: entity.month,
      date: new Date(entity.date),
      startDate: CustomValidator.nonEmptyString(entity.startDate) ? new Date(entity.startDate) : null,
      endDate: CustomValidator.nonEmptyString(entity.endDate) ? new Date(entity.endDate) : null,
      serviceCode: entity.serviceCode,
      produceTime: entity.produceTime,
      genStatus: entity.genStatus,
      reportFile: entity.reportFile,
      requestInfo: entity.requestInfo,
      once: entity.once,
      __cc: entity.__cc,
      __sc: entity.__sc,
      __vn: 0,
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

  /**
   * Update By Id
   * @param {String} id
   * @param {ReportMainEntity} entity
   * @param {Number} entity.genStatus
   * @param {Object} entity.reportFile
   * @param {Number} entity.produceTime
   * @returns {ReportMainEntity}
   */
  static async updateById(id, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.REPORTMAIN);
    const query = {
      _id: ObjectId(id),
      valid: true,
    };
    const obj = {
      genStatus: entity.genStatus,
      reportFile: entity.reportFile,
      produceTime: entity.produceTime,
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
   * 條件搜尋
   * @param {Object} qbe 搜尋條件
   * @param {String} sort 排序
   * @returns {ReportMainEntity[]}
   */
  static async findByQbe(qbe, sort) {
    const col = DefaultDBClient.getCollection(modelCodes.REPORTMAIN);
    const query = {};
    Object.keys(qbe).forEach((k) => {
      if (k === 'companyId') {
        query[k] = ObjectId(qbe[k]);
      } else {
        query[k] = qbe[k];
      }
    });
    query.valid = true;

    try {
      const resList = await col.find(query).sort(sort).lean();
      if (!resList) { return undefined; }

      const resArray = [];
      for (const f of resList) {
        resArray.push(_transform(f));
      }
      return resArray;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * 使用id列表查詢資料
   * @param {Array} ids id列表
   * @returns {ReportMainEntity[]}
   */
  static async findByIds(ids) {
    const col = DefaultDBClient.getCollection(modelCodes.REPORTMAIN);

    ids.forEach((item, index) => {
      if (!ObjectId.isValid(item)) { return undefined; }
      ids[index] = ObjectId(item);
    });
    const query = {
      _id: { $in: ids },
      valid: true,
    };

    try {
      const resList = await col.find(query).lean();
      if (!resList) { return undefined; }

      const resArray = [];
      for (const f of resList) {
        resArray.push(_transform(f));
      }
      return resArray;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * 使用id列表批次刪除
   * @param {Array} ids id列表
   * @param {Object} baseInfo 基本資料 __cc, __sc
   * @param {String} modifier 更新人
   * @param {Object} session Session
   * @returns {Boolean}
   */
  static async deleteByIds(ids, baseInfo = {}, modifier = '', session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.REPORTMAIN);

    ids.forEach((item, index) => {
      if (!ObjectId.isValid(item)) { return undefined; }
      ids[index] = ObjectId(item);
    });
    const query = {
      _id: { $in: ids },
      valid: true,
    };
    const obj = {
      valid: false,
      reportFile: {},
      __cc: baseInfo.__cc,
      __sc: baseInfo.__sc,
    };
    if (ObjectId.isValid(modifier)) {
      obj.modifier = ObjectId(modifier);
    }

    try {
      const res = await col.updateMany(query, { $set: obj, $inc: { __vn: 1 } }, { session });
      if (res.n !== ids.length && res.nModified !== ids.length) {
        throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
      }
      return true;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = ReportMainRepository;
