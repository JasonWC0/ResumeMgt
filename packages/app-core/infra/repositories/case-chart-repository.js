/**
 * FeaturePath: Common-Repository--個案圖資
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
const { CaseChartEntity, modelCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  return new CaseChartEntity()
    .bindObjectId(doc._id.toString())
    .bind(doc);
}

class CaseChartRepository {
  /**
   * @param {CaseChartEntity} CaseChartEntity case chart
   * @return {CaseChartEntity} return CaseChartEntity json data
   */
  static async save(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.CASECHART);
    const upd = {
      chart: entity.chart,
      maker: entity.maker,
      makeDate: entity.makeDate,
      relationChart: entity.relationChart,
      structureChart: entity.structureChart,
      isTemp: entity.isTemp,
      isDraw: entity.isDraw,
      valid: entity.valid,
      modifier: entity.modifier,
    };
    if (entity?.id) {
      const res = await col.findOneAndUpdate({ _id: ObjectId(entity.id) }, { $set: upd, $inc: { __vn: 1 } }, { new: true }).lean();
      return _transform(res);
    }
    try {
      const doc = {
        caseId: entity.caseId,
        companyId: entity.companyId,
        category: entity.category,
        ...upd,
        creator: entity.creator,
        __vn: 0,
        __cc: entity.__cc,
        __sc: entity.__sc,
        valid: true,
      };
      await col.create(doc);
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @param {String} id
   * @return {CaseChartEntity} return CaseChartEntity json data
   */
  static async findOne(id = '') {
    if (!ObjectId.isValid(id)) { return undefined; }
    const col = DefaultDBClient.getCollection(modelCodes.CASECHART);

    try {
      const res = await col.findOne({ _id: ObjectId(id), valid: true }).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @param {String} id
   * @return {Array<CaseChartEntity>} return array contains CaseChartEntity json data
   */
  static async listQbe(qbe = {}) {
    const query = {
      valid: true,
    };
    if (ObjectId.isValid(qbe.caseId)) query.caseId = ObjectId(qbe.caseId);
    const col = DefaultDBClient.getCollection(modelCodes.CASECHART);

    try {
      const res = await col.find(query).lean();
      return res.map((r) => _transform(r));
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
  * @param {String} id
  * @return {CaseChartEntity} return CaseChartEntity json data
  */
  static async findOneReferByAnother(id = '') {
    if (!ObjectId.isValid(id)) { return undefined; }
    const col = DefaultDBClient.getCollection(modelCodes.CASECHART);

    try {
      const [res] = await col.aggregate([
        {
          $match: { _id: ObjectId(id), valid: true },
        },
        {
          $lookup: {
            from: `${modelCodes.CASECHART}s`,
            localField: 'chart.id',
            foreignField: 'relationChart.id',
            as: 'refer',
          },
        }]);
      return _transform(res).bindRefer(res.refer);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async delete(id, modifier) {
    if (!ObjectId.isValid(id)) { return undefined; }
    const col = DefaultDBClient.getCollection(modelCodes.CASECHART);

    try {
      return col.updateOne({ _id: ObjectId(id), valid: true }, {
        $set: {
          valid: false,
          modifier,
        },
      });
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = CaseChartRepository;
