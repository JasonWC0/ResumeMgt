/**
 * FeaturePath: Common-Repository--審核歷程
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-review-history-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-15 09:54:49 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const moment = require('moment');
const { ObjectId } = require('mongoose').Types;
const {
  LOGGER, models, codes, tools,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { FormReviewHistoryEntity, modelCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new FormReviewHistoryEntity().bindDB(doc).bindObjectId(doc._id.toString());
  return entity;
}

function _prepareQueryObj(qbe = {}) {
  const query = {};
  if (tools.CustomValidator.nonEmptyString(qbe.companyId) && ObjectId.isValid(qbe.companyId)) {
    query.companyId = ObjectId(qbe.companyId);
  }
  if (tools.CustomValidator.nonEmptyString(qbe.c)) {
    query.category = qbe.c;
  }
  if (tools.CustomValidator.nonEmptyString(qbe.personId) && ObjectId.isValid(qbe.personId)) {
    query['submitter.personId'] = ObjectId(qbe.personId);
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
  if (tools.CustomValidator.nonEmptyArray(qbe.status)) {
    query.status = {
      $in: qbe.status,
    };
  }
  return query;
}

class FormReviewHistoryRepository {
  /**
   * @param {FormEntity} entity
   * @param {Boolean} throwError
   * @returns {Promise.<FormReviewHistoryEntity>} return FormReviewHistoryEntity
   */
  static async createOne(entity, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
    if (!ObjectId.isValid(entity.companyId)) { return undefined; }
    if (!ObjectId.isValid(entity.fid)) { return undefined; }
    if (!ObjectId.isValid(entity.submitter.personId)) { return undefined; }

    const obj = {
      clientDomain: entity.clientDomain,
      companyId: ObjectId(entity.companyId),
      category: entity.category,
      type: entity.type,
      fid: ObjectId(entity.fid),
      submittedAt: entity.submittedAt,
      status: entity.status,
      comment: entity.comment,
      content: entity.content,
      submitter: {
        personId: ObjectId(entity.submitter.personId),
        name: entity.submitter.name,
      },
      fillerName: entity.fillerName,
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
   * @param {String} fid
   * @param {String} category FormCategoryCode
   * @param {String} type
   * @returns {Promise.<FormReviewHistoryEntity>} return FormReviewHistoryEntity
   */
  static async findListByFid(fid, category, type) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
    try {
      const query = {
        fid: ObjectId(fid),
        category,
        type,
      };

      const res = await col.find(query).sort({ createdAt: 1 }).lean();
      const resArray = [];
      for (const d of res) {
        resArray.push(_transform(d));
      }
      return resArray;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @param {Object} qbe
   * @param {String} qbe.personId
   * @param {String} qbe.c category
   * @param {String} qbe.f submittedAt from
   * @param {String} qbe.e submittedAt end
   * @param {String} qbe.status
   * @param {Number} qbe.skip
   * @param {Number} qbe.limit
   * @returns {Promise.<FormReviewHistoryEntity[]>} return FormReviewHistoryEntity[] json array
   */
  static async findByQBE(qbe = {}, sort = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
    const query = _prepareQueryObj(qbe);

    try {
      const resList = await col.find(query).sort(sort)
        .skip(Number.parseInt(qbe.skip, 10))
        .limit(Number.parseInt(qbe.limit, 10))
        .lean();

      const resArray = [];
      for (const d of resList) {
        resArray.push(_transform(d));
      }
      return resArray;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @param {Object} qbe
   * @param {String} qbe.personId
   * @param {String} qbe.c category
   * @param {String} qbe.f submittedAt from
   * @param {String} qbe.e submittedAt end
   * @param {String} qbe.status
   * @returns {Number} count
   */
  static async countByQBE(qbe = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMREVIEWHISTORY);
    const query = _prepareQueryObj(qbe);

    try {
      const count = await col.countDocuments(query).lean();
      return count;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = FormReviewHistoryRepository;
