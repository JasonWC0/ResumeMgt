/* eslint-disable consistent-return */
/**
 * FeaturePath: Common-Repository--審核狀態
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-review-status-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-15 09:54:34 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const moment = require('moment');
const { ObjectId } = require('mongoose').Types;
const {
  LOGGER, models, codes, tools,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { FormReviewStatusEntity, modelCodes } = require('../../domain');
const commonDelete = require('./common-function/delete');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new FormReviewStatusEntity().bindDB(doc).bindObjectId(doc._id.toString());
  return entity;
}

class FormReviewStatusRepository {
  /**
  * @param {FormReviewStatusEntity} entity
  * @param {Boolean} throwError
  * @returns {Promise.<FormReviewStatusEntity>} return FormReviewStatusEntity
  */
  static async createOne(entity, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
    if (!ObjectId.isValid(entity.companyId)) { return undefined; }
    if (!ObjectId.isValid(entity.fid)) { return undefined; }
    if (tools.CustomValidator.nonEmptyString(entity.nowReviewer)) {
      if (!ObjectId.isValid(entity.nowReviewer)) { return undefined; }
      entity.nowReviewer = ObjectId(entity.nowReviewer);
    } else {
      entity.nowReviewer = null;
    }
    entity.reviewers.forEach((item) => {
      if (!ObjectId.isValid(item)) { return undefined; }
      ObjectId(item);
    });

    const obj = {
      clientDomain: entity.clientDomain,
      companyId: ObjectId(entity.companyId),
      category: entity.category,
      type: entity.type,
      fid: ObjectId(entity.fid),
      reviewRoles: entity.reviewRoles,
      reviewers: entity.reviewers,
      layerAt: entity.layerAt,
      nowReviewRole: entity.nowReviewRole,
      nowReviewer: entity.nowReviewer,
      submittedAt: entity.submittedAt,
      status: entity.status,
      comment: entity.comment,
      fillerName: entity.fillerName,
      lastReviewerName: entity.lastReviewerName,
      content: entity.content,
      __cc: entity.__cc,
      __vn: entity.__vn,
      __sc: entity.__sc,
    };

    try {
      const res = await col.create([obj], { session });
      entity.bindObjectId(res[0]._id.toString());
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @param {string} id
   * @param {FormReviewStatusEntity} entity FormReviewStatusEntity
   * @param {boolean} throwError throwError or not
   * @returns {Promise.<FormReviewStatusEntity>} return FormReviewStatusEntity
   */
  static async updateById(id, entity, session = null, throwError = true) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
    if (!ObjectId.isValid(id)) { return undefined; }
    if (tools.CustomValidator.nonEmptyString(entity.nowReviewer)) {
      if (!ObjectId.isValid(entity.nowReviewer)) { return undefined; }
      entity.nowReviewer = ObjectId(entity.nowReviewer);
    } else {
      entity.nowReviewer = null;
    }
    entity.reviewers.forEach((item) => {
      if (!ObjectId.isValid(item)) { return undefined; }
      ObjectId(item);
    });

    const query = {
      _id: ObjectId(id),
    };
    const obj = {
      status: entity.status,
      comment: entity.comment,
      layerAt: entity.layerAt,
      reviewRoles: entity.reviewRoles,
      reviewers: entity.reviewers,
      nowReviewRole: entity.nowReviewRole,
      nowReviewer: entity.nowReviewer,
      lastReviewerName: entity.lastReviewerName,
      fillerName: entity.fillerName,
      __cc: entity.__cc,
      __sc: entity.__sc,
    };

    try {
      const res = await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } }, { session });
      if (res.n !== 1 && res.nModified !== 1) {
        throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
      }
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      if (throwError) {
        throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
      } else {
        return false;
      }
    }
  }

  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
    if (!ObjectId.isValid(id)) {
      return undefined;
    }

    try {
      const res = await col.findById(id).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @param {Array} ids
   * @returns {Promise.<FormReviewStatusEntity[]>}
   */
  static async findByIds(ids) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
    const idsArray = [];
    // eslint-disable-next-line consistent-return
    ids.forEach((id) => {
      if (!ObjectId.isValid(id)) {
        return undefined;
      }
      idsArray.push(ObjectId(id));
    });

    try {
      const resList = await col.find({ _id: { $in: idsArray } }).lean();
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
  * @param {Array} array fids
  * @param {string} category FormCategoryCode
  * @param {type} type
  * @return {Promise.<FormReviewStatusEntity[]>}
  */
  static async findListByFids(array = [], category, type) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
    array.forEach((item, index) => {
      if (!ObjectId.isValid(item)) { return undefined; }
      array[index] = ObjectId(item);
    });

    try {
      const resList = await col.find({ fid: { $in: array }, category, type }).lean();
      if (!resList) {
        return undefined;
      }

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
   * @param {Object} qbe
   * @returns {Promise.<FormReviewStatusEntity[]>}
   */
  static async findByQBE(qbe = {}, sort = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
    const query = {};
    if (tools.CustomValidator.nonEmptyString(qbe.companyId) && ObjectId.isValid(qbe.companyId)) {
      query.companyId = ObjectId(qbe.companyId);
    }
    if (qbe.status && typeof qbe.status === 'number') {
      query.status = qbe.status;
    }
    if (tools.CustomValidator.nonEmptyString(qbe.c)) {
      query.category = qbe.c;
    }
    if (tools.CustomValidator.nonEmptyString(qbe.t)) {
      query.type = qbe.y;
    }
    if (tools.CustomValidator.nonEmptyString(qbe.f)) {
      if (!query.submittedAt) {
        query.submittedAt = {};
      }
      query.submittedAt.$gte = moment(qbe.f, 'YYYY/MM/DD').toDate();
    }
    if (tools.CustomValidator.nonEmptyString(qbe.e)) {
      if (!query.submittedAt) {
        query.submittedAt = {};
      }
      query.submittedAt.$lt = moment(qbe.e, 'YYYY/MM/DD').add(1, 'days').toDate();
    }
    const orQuery = [];
    if (tools.CustomValidator.nonEmptyArray(qbe.nowReviewRole)) {
      orQuery.push({
        nowReviewRole: {
          $in: qbe.nowReviewRole,
        },
      });
    }
    if (tools.CustomValidator.nonEmptyString(qbe.nowReviewer)) {
      orQuery.push({ nowReviewer: qbe.nowReviewer });
    }
    if (tools.CustomValidator.nonEmptyArray(orQuery)) {
      query.$or = orQuery;
    }

    try {
      const resList = await col.find(query).sort(sort).lean();
      const resArray = [];
      for (const c of resList) {
        resArray.push(_transform(c));
      }
      return resArray;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @param {String} id
   * @returns {String} id
   */
  static async deleteById(id, baseInfo = {}, modifier = '') {
    const col = DefaultDBClient.getCollection(modelCodes.FORMREVIEWSTATUS);
    await commonDelete.deleteById(col, id, baseInfo.__cc, baseInfo.__sc, modifier);
  }
}

module.exports = FormReviewStatusRepository;
