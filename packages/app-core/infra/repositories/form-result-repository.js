/**
 * FeaturePath: Common-Repository--表單結果
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-result-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-15 02:08:22 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');
const { ObjectId } = require('mongoose').Types;
const {
  LOGGER, models, codes, tools,
} = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { FormResultEntity, modelCodes } = require('../../domain');
const commonDelete = require('./common-function/delete');

const FORM_RESULT_FIELD = {
  _id: '_id',
  caseId: 'caseId',
  category: 'category',
  type: 'type',
  fillDate: 'fillDate',
  nextEvaluationDate: 'nextEvaluationDate',
};

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new FormResultEntity().bindDB(doc).bindObjectId(doc._id.toString());
  return entity;
}

function _prepareQuery(qbe) {
  const query = {
    valid: true,
  };
  if (tools.CustomValidator.nonEmptyString(qbe.caseId) && ObjectId.isValid(qbe.caseId)) {
    query.caseId = ObjectId(qbe.caseId);
  }
  if (tools.CustomValidator.nonEmptyArray(qbe.caseIds)) {
    const caseIds = qbe.caseIds
      .filter((caseId) => ObjectId.isValid(caseId))
      .map((caseId) => ObjectId(caseId));

    query.caseId = { $in: caseIds };
  }
  if (tools.CustomValidator.nonEmptyString(qbe.companyId) && ObjectId.isValid(qbe.companyId)) {
    query.companyId = ObjectId(qbe.companyId);
  }
  if (tools.CustomValidator.nonEmptyString(qbe.c)) {
    query.category = qbe.c;
  }
  if (tools.CustomValidator.nonEmptyString(qbe.t)) {
    query.type = qbe.t;
  }
  return query;
}

class FormResultRepository {
  /**
   * @param {FormResultEntity} entity
   * @param {Boolean} throwError
   * @returns {Promise.<FormResultEntity>} return FormResultEntity
   */
  static async createOne(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMRESULT);
    if (tools.CustomValidator.nonEmptyArray(entity.signatures)) {
      entity.signatures.forEach((v) => ObjectId(v));
    }
    const obj = {
      clientDomain: entity.clientDomain,
      formId: ObjectId(entity.formId),
      companyId: ObjectId(entity.form.companyId),
      category: entity.form.category,
      type: entity.form.type,
      caseId: ObjectId(entity.caseId),
      fillDate: entity.fillDate,
      filler: {
        personId: ObjectId(entity.filler.personId),
        name: entity.filler.name,
      },
      nextEvaluationDate: entity.nextEvaluationDate,
      result: entity.result,
      files: entity.files,
      signatures: entity.signatures,
      creator: ObjectId(entity.creator),
      modifier: ObjectId(entity.modifier),
      submittedAt: entity.submittedAt,
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

  /**
   * @param {String} id _id
   * @returns {Promise.<FormResultEntity>} return FormResultEntity
   */
  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMRESULT);
    if (!ObjectId.isValid(id)) { return undefined; }
    const obj = {
      _id: Object(id),
      valid: true,
    };

    try {
      const res = await col.findOne(obj).populate('signatures').lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @param {String} id _id
   * @param {FormResultEntity} entity
   * @returns {Promise.<FormResultEntity>} return FormResultEntity
   */
  static async updateById(id, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMRESULT);
    if (!ObjectId.isValid(id)) { return undefined; }

    const query = {
      _id: ObjectId(id),
      valid: true,
    };
    const obj = {
      fillDate: entity.fillDate,
      filler: {
        personId: ObjectId(entity.filler.personId),
        name: entity.filler.name,
      },
      nextEvaluationDate: entity.nextEvaluationDate,
      result: entity.result,
      files: entity.files,
      modifier: ObjectId(entity.modifier),
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
   * @param {Object} qbe
   * @param {String} qbe.caseId
   * @param {String} qbe.c category
   * @param {String} qbe.t type
   * @param {Object} qbe.order sort order
   * @param {Number} qbe.skip
   * @param {Number} qbe.limit
   * @param {Date} qbe.f fillDate fromDate
   * @param {Date} qbe.e fillDate endDate
   * @returns {Promise.<FormResultEntity>[]} return FormResultEntity[]
   */
  static async findByQBE(qbe) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMRESULT);
    const query = _prepareQuery(qbe);
    if (CustomValidator.nonEmptyString(qbe.f) && CustomValidator.nonEmptyString(qbe.e)) {
      query.fillDate = {
        $gte: moment(qbe.f, 'YYYY/MM/DD').toDate(),
        $lt: moment(qbe.e, 'YYYY/MM/DD').add(1, 'days').toDate(),
      };
    }

    try {
      const resList = await col.find(query).populate('signatures').populate('formId').sort(qbe.order)
        .skip(Number.parseInt(qbe.skip, 10))
        .limit(Number.parseInt(qbe.limit, 10))
        .lean();
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
   * @param {String} qbe.caseIds
   * @param {String} qbe.c category
   * @param {String} qbe.t type
   * @returns {Number} count
   */
  static async countByQBE(qbe) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMRESULT);
    const query = _prepareQuery(qbe);
    if (CustomValidator.nonEmptyString(qbe.f) && CustomValidator.nonEmptyString(qbe.e)) {
      query.fillDate = {
        $gte: moment(qbe.f, 'YYYY/MM/DD').toDate(),
        $lt: moment(qbe.e, 'YYYY/MM/DD').add(1, 'days').toDate(),
      };
    }

    try {
      const count = await col.countDocuments(query);
      return count;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Query The CaseNewest By Company
   * @param {String} companyId
   * @param {Array} type
   * @returns {Object[]}
   */
  static async findCaseNewest(companyId, type) {
    const col = DefaultDBClient.getCollection(modelCodes.FORMRESULT);
    const query = {
      companyId: ObjectId(companyId),
      valid: true,
      type: { $in: type },
    };

    try {
      const aggregate = col.aggregate();
      const resList = await aggregate
        .match(query)
        .sort({ fillDate: -1 })
        .group({
          _id: {
            caseId: `$${FORM_RESULT_FIELD.caseId}`,
            category: `$${FORM_RESULT_FIELD.category}`,
            type: `$${FORM_RESULT_FIELD.type}`,
          },
          fillDate: { $first: `$${FORM_RESULT_FIELD.fillDate}` },
          nextEvaluationDate: { $first: `$${FORM_RESULT_FIELD.nextEvaluationDate}` },
        })
        .group({
          _id: `$${FORM_RESULT_FIELD._id}.${FORM_RESULT_FIELD.caseId}`,
          list: {
            $push: {
              category: `$${FORM_RESULT_FIELD._id}.${FORM_RESULT_FIELD.category}`,
              type: `$${FORM_RESULT_FIELD._id}.${FORM_RESULT_FIELD.type}`,
              fillDate: `$${FORM_RESULT_FIELD.fillDate}`,
              nextEvaluationDate: `$${FORM_RESULT_FIELD.nextEvaluationDate}`,
            },
          },
        });

      const resArray = [];
      resList.forEach((r) => {
        if (r) {
          r._id = r._id.toString();
          resArray.push(r);
        }
      });

      return resArray;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @param {String} id _id
   * @returns {Boolean}
   */
  static async deleteById(id, baseInfo = {}, modifier = '') {
    const col = DefaultDBClient.getCollection(modelCodes.FORMRESULT);
    const res = await commonDelete.deleteById(col, id, baseInfo.__cc, baseInfo.__sc, modifier);
    return res;
  }
}

module.exports = FormResultRepository;
