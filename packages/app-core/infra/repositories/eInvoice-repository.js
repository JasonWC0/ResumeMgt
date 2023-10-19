/**
 * FeaturePath: Common-Repository--電子發票
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: eInvoice-repository.js
 * Project: @erpv3/app-core
 * File Created: 2023-03-07 04:45:35 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');
const { ObjectId } = require('mongoose').Types;
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { EInvoiceEntity, eInvoiceCodes, modelCodes } = require('../../domain');

const { eInvoiceStatusCodes } = eInvoiceCodes;

const DATE_FORMAT = 'YYYY/MM/DD';
const FIELD = {
  _id: '_id',
  companyId: 'companyId',
  caseId: 'caseId',
  personId: 'personId',
  caseInfo: 'caseInfo',
  personInfo: 'personInfo',
  count: 'count',
};
const objectIdList = [FIELD._id, FIELD.caseId, FIELD.companyId];

/**
 * 轉換DB format為entity
 * @param {Object} doc
 * @returns {EInvoiceEntity}
 */
function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new EInvoiceEntity().bindDB(doc).bindObjectId(doc._id.toString());
  return entity;
}

/**
 * 組成基本寫入物件
 * @param {EInvoiceEntity} entity
 * @returns {Object}
 */
function _prepareObj(entity) {
  const obj = {
    invType: entity.invType,
    taxType: entity.taxType,
    vat: entity.vat,
    specialTaxType: entity.specialTaxType,
    clearanceMark: entity.clearanceMark,
    amount: entity.amount,
    identifier: entity.identifier,
    customer: entity.customer,
    donation: entity.donation,
    npoCode: entity.npoCode,
    carrierType: entity.carrierType,
    carrierNum: entity.carrierNum,
    note: entity.note,
    items: entity.items,
    modifier: ObjectId.isValid(entity?.modifier) ? ObjectId(entity.modifier) : undefined,
    __cc: entity.__cc,
    __sc: entity.__sc,
  };
  return obj;
}

/**
 * 組成電子發票列表的aggregate
 * @param {object} aggregate mongo aggregate
 * @param {object} qbe
 * @param {String} qbe.companyId 機構Id
 * @param {Array} qbe.status 狀態列表
 * @param {Boolean} qbe.queryIssued 是否query開立日期
 * @param {String} qbe.sDate 開始日期 YYYY/MM/DD
 * @param {String} qbe.eDate 結束日期 YYYY/MM/DD
 */
async function _listAggregate(aggregate, qbe = {}) {
  const query = {
    valid: true,
    companyId: ObjectId(qbe.companyId),
    status: { $in: qbe.status },
  };
  if (qbe.queryIssued && CustomValidator.nonEmptyString(qbe.sDate) && CustomValidator.nonEmptyString(qbe.eDate)) {
    query.issuedDate = {
      $gte: moment(qbe.sDate, DATE_FORMAT).toDate(),
      $lt: moment(qbe.eDate, DATE_FORMAT).add(1, 'days').toDate(),
    };
  }

  await aggregate
    .match(query)
    .lookup({
      from: `${modelCodes.CASE}s`,
      localField: `${FIELD.caseId}`,
      foreignField: `${FIELD._id}`,
      as: `${FIELD.caseInfo}`,
    })
    .unwind({ path: `$${FIELD.caseInfo}`, preserveNullAndEmptyArrays: true })
    .addFields({ personId: `$${FIELD.caseInfo}.${FIELD.personId}` })
    .lookup({
      from: `${modelCodes.PERSON}s`,
      localField: `${FIELD.personId}`,
      foreignField: `${FIELD._id}`,
      as: `${FIELD.personInfo}`,
    })
    .unwind({ path: `$${FIELD.personInfo}`, preserveNullAndEmptyArrays: true });
}

class EInvoiceRepository {
  /**
   * 新增電子發票
   * @param {EInvoiceEntity} entity
   * @returns {Promise.<EInvoiceEntity>} return EInvoiceEntity
   */
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.EINVOICE);
    if (!ObjectId.isValid(entity.companyId) || !ObjectId.isValid(entity.caseId)) {
      return undefined;
    }

    const createObj = {
      companyId: ObjectId(entity.companyId),
      serialString: entity.serialString,
      caseId: ObjectId(entity.caseId),
      status: eInvoiceStatusCodes.unIssued,
      creator: ObjectId.isValid(entity?.creator) ? ObjectId(entity.creator) : undefined,
      valid: true,
      __vn: 0,
    };
    const commonObj = _prepareObj(entity);
    const obj = Object.assign(createObj, commonObj);

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
   * 編輯電子發票
   * @param {String} id 發票ObjectId
   * @param {EInvoiceEntity} entity
   * @returns {Promise.<EInvoiceEntity>} return EInvoiceEntity
   */
  static async updateById(id, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.EINVOICE);
    if (!ObjectId.isValid(id)) { return undefined; }

    const query = {
      _id: ObjectId(id),
      valid: true,
    };
    const obj = _prepareObj(entity);

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
   * 更新部分欄位
   * @param {String} id
   * @param {Object} obj
   * @returns {Boolean}
   */
  static async updateOne(id, obj) {
    const col = DefaultDBClient.getCollection(modelCodes.EINVOICE);
    if (!ObjectId.isValid(id)) { return undefined; }
    const query = {
      _id: ObjectId(id),
      valid: true,
    };
    Object.keys(obj).forEach((key) => {
      obj[key] = objectIdList.includes(key) ? ObjectId(obj[key]) : obj[key];
    });

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

  /**
   * 依據id更新多筆資料
   * @param {Array} objArray
   * @param {String} objArray.id
   * @param {Object} objArray.setData
   * @returns {Number}
   */
  static async updateMulti(objArray) {
    const col = DefaultDBClient.getCollection(modelCodes.EINVOICE);
    const bulkArray = objArray.map((obj) => {
      const { id, setData } = obj;
      setData.modifier = ObjectId.isValid(setData.modifier) ? ObjectId(setData.modifier) : undefined;
      return {
        updateOne: {
          filter: { _id: ObjectId(id) },
          update: {
            $set: setData,
            $inc: { __vn: 1 },
          },
        },
      };
    });

    try {
      const res = await col.bulkWrite(bulkArray);
      return res.modifiedCount;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * 查詢一筆電子發票
   * @param {Object} qbe
   * @returns {EInvoiceEntity}
   */
  static async findOne(qbe = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.EINVOICE);
    const query = {
      valid: true,
    };
    Object.keys(qbe).forEach((key) => {
      query[key] = objectIdList.includes(key) ? ObjectId(qbe[key]) : qbe[key];
    });

    try {
      const res = await col.findOne(qbe).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * 查詢電子發票列表
   * @param {Object} qbe
   * @param {String} qbe.companyId 機構Id
   * @param {Array} qbe.status 狀態列表
   * @param {Boolean} qbe.queryIssued 是否query開立日期
   * @param {String} qbe.sDate 開始日期 YYYY/MM/DD
   * @param {String} qbe.eDate 結束日期 YYYY/MM/DD
   * @returns {Object[]}
   */
  static async findByQBE(qbe = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.EINVOICE);

    try {
      const aggregate = col.aggregate();
      await _listAggregate(aggregate, qbe);
      const resList = await aggregate
        .skip(Number.parseInt(qbe.skip, 10))
        .limit(Number.parseInt(qbe.limit, 10));

      return resList;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * 計算電子發票總數
   * @param {Object} qbe
   * @param {String} qbe.companyId 機構Id
   * @param {Array} qbe.status 狀態列表
   * @param {Boolean} qbe.queryIssued 是否query開立日期
   * @param {String} qbe.sDate 開始日期 YYYY/MM/DD
   * @param {String} qbe.eDate 結束日期 YYYY/MM/DD
   * @returns {Number}
   */
  static async countByQBE(qbe = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.EINVOICE);

    try {
      const aggregate = col.aggregate();
      await _listAggregate(aggregate, qbe);
      const res = await aggregate.project({ _id: 1 }).count(FIELD.count);

      return (res[0]) ? res[0].count : 0;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = EInvoiceRepository;
