/**
 * FeaturePath: Common-Repository--個案
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */
const moment = require('moment');
const {
  LOGGER,
  models,
  codes,
  tools,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { ObjectId } = require('mongoose').Types;
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const {
  modelCodes,
  companyServiceCodes,
  caseServiceStatusCodes,
  CaseEntity,
} = require('../../domain');
const commonDelete = require('./common-function/delete');

const FIELD = {
  _id: '_id',
  personInfo: 'personInfo',
  caseStatusHistory: 'caseStatusHistory',
  carePlanInfo: 'carePlanInfo',
  caseId: 'caseId',
  valid: 'valid',
  personId: 'personId',
  caseNumber: 'caseNumber',
  hashName: 'hashName',
  status: 'status',
  nowStatus: 'nowStatus',
  startDate: 'startDate',
  endDate: 'endDate',
  caseStartDate: 'caseStartDate',
  caseEndDate: 'caseEndDate',
  date: 'date',
  hist: 'hist',
  planType: 'planType',
  planEndDate: 'planEndDate',
  count: 'count',
};

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  return new CaseEntity()
    .bind(doc)
    .bindObjectId(doc._id.toString())
    .bindPersonId(doc.personId.toString())
    .bindCompanyId(doc.companyId.toString());
}

function _transformPopulatePerson(doc) {
  if (!doc) {
    return undefined;
  }
  return new CaseEntity()
    .bind(doc)
    .bindObjectId(doc._id.toString())
    .bindCompanyId(doc.companyId.toString())
    .bindPersonId(doc.personId._id.toString())
    .bindPersonObject(doc.personId);
}

/**
 * 組合query個案條件及query hash後的姓名
 * @param {Object} qbe query條件
 * @param {String} qbe.serviceCategory 個案服務(多服務使用,區隔)
 * @param {String} qbe.status 個案案號
 * @param {String} qbe.name 個案姓名
 * @param {String} companyId 機構Id
 * @returns {Object} query, queryName
 */
async function _parseFuzzySearchQbe(qbe = {}, companyId = '') {
  const query = {
    companyId: ObjectId(companyId),
    $and: [],
    valid: true,
  };

  const qServiceCategoryAry = [];
  const qCaseNumberAry = [];

  if (CustomValidator.nonEmptyString(qbe.serviceCategory)) {
    qbe.serviceCategory
      .split(',')
      .forEach((sc) => {
        if (!Object.values(companyServiceCodes).includes(sc)) return;
        const q = {};
        q[`${sc.toLowerCase()}.${FIELD.valid}`] = true;
        qServiceCategoryAry.push(q);

        if (CustomValidator.nonEmptyString(qbe.caseNumber)) {
          const c = {};
          c[`${sc.toLowerCase()}.${FIELD.caseNumber}`] = { $regex: qbe.caseNumber };
          qCaseNumberAry.push(c);
        }
      });
  }

  if (CustomValidator.nonEmptyArray(qServiceCategoryAry)) {
    query.$and.push({ $or: qServiceCategoryAry });
  }
  if (CustomValidator.nonEmptyArray(qCaseNumberAry)) {
    query.$and.push({ $or: qCaseNumberAry });
  }
  const queryName = {};
  if (CustomValidator.nonEmptyString(qbe.name)) {
    let hn = '';
    for await (const c of qbe.name) {
      hn += (await tools.CustomUtils.hashedWithSalt(c)).substring(0, 8);
    }
    queryName[`${FIELD.personInfo}.${FIELD.hashName}`] = { $regex: hn };
  }

  return {
    query,
    queryName,
  };
}

/**
 * 組合filter個案歷史狀態及query個案狀態
 * @param {String} serviceCategory 個案服務(多服務使用,區隔)
 * @param {Number} status 個案狀態
 * @param {Date} date 該天日期以前
 * @returns {Object} nowStatusFilter, caseStatusQuery
 */
async function _caseStatusQbe(serviceCategory, status, date = moment().startOf('day').add(1, 'days').toDate()) {
  const nowStatusFilter = {};
  let caseStatusQuery = {};
  const qStatusAry = [];
  if (CustomValidator.nonEmptyString(serviceCategory)) {
    serviceCategory
      .split(',')
      .forEach((sc) => {
        if (!Object.values(companyServiceCodes).includes(sc)) return;
        nowStatusFilter[`${sc.toLowerCase()}.${FIELD.nowStatus}`] = {
          $let: {
            vars: {
              // 於個案狀態資料filter當天之前的資料，並取最新一筆
              caseStatusHistory: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: `$${FIELD.caseStatusHistory}.${sc.toLowerCase()}`,
                      as: FIELD.hist,
                      cond: {
                        $and: [
                          { $lt: [`$$${FIELD.hist}.${FIELD.date}`, date] }
                        ],
                      },
                    },
                  },
                  -1
                ],
              },
              caseStartDate: { $ifNull: [`$${sc.toLowerCase()}.${FIELD.startDate}`, null] },
              caseEndDate: { $ifNull: [`$${sc.toLowerCase()}.${FIELD.endDate}`, null] },
            },
            in: {
              $switch: {
                branches: [
                  {
                    // case1: 服務結束日期在當天之前 => 狀態: 結案
                    case: { $and: [{ $ne: [`$$${FIELD.caseEndDate}`, null] }, { $lt: [`$$${FIELD.caseEndDate}`, date] }] },
                    then: caseServiceStatusCodes.closed,
                  },
                  {
                    // case2: 沒有服務開始日期 or 有服務開始日期但在當天之後 => 狀態: 待確認
                    case: {
                      $or: [
                        { $eq: [`$$${FIELD.caseStartDate}`, null] },
                        { $and: [{ $ne: [`$$${FIELD.caseStartDate}`, null] }, { $gte: [`$$${FIELD.caseStartDate}`, date] }] },
                        { $and: [{ $ne: [`$$${FIELD.caseEndDate}`, null] }, { $lt: [`$$${FIELD.caseEndDate}`, date] }] }
                      ],
                    },
                    then: caseServiceStatusCodes.toBoConfirmed,
                  },
                  {
                    // case3: 於個案狀態資料 => 狀態: 個案於當天前最後一筆狀態
                    case: { $in: [`$$${FIELD.caseStatusHistory}.${FIELD.status}`, Object.values(caseServiceStatusCodes)] },
                    then: `$$${FIELD.caseStatusHistory}.${FIELD.status}`,
                  },
                  {
                    // case4: 服務開始日期在當天之前 => 狀態: 服務中
                    case: { $and: [{ $ne: [`$$${FIELD.caseStartDate}`, null] }, { $lt: [`$$${FIELD.caseStartDate}`, date] }] },
                    then: caseServiceStatusCodes.service,
                  }
                ],
                default: null,
              },
            },
          },
        };

        const s = {};
        switch (status) {
          case caseServiceStatusCodes.service:
          case caseServiceStatusCodes.toBoConfirmed:
          case caseServiceStatusCodes.pending:
          case caseServiceStatusCodes.closed:
            s[`${sc.toLowerCase()}.${FIELD.nowStatus}`] = status;
            s[`${sc.toLowerCase()}.${FIELD.valid}`] = true;
            qStatusAry.push(s);
            break;
          default:
            break;
        }
      });
  }

  if (CustomValidator.nonEmptyArray(qStatusAry)) {
    caseStatusQuery = { $or: qStatusAry };
  }
  return { nowStatusFilter, caseStatusQuery };
}

class CaseRepository {
  static async aggregateCase(aggregate, companyId = '', qbe = {}) {
    const { query, queryName } = await _parseFuzzySearchQbe(qbe, companyId);
    const { nowStatusFilter, caseStatusQuery } = await _caseStatusQbe(qbe.serviceCategory, qbe.status, qbe.date);
    const carePlanQuery = {};
    const planQEndDateQ1 = {};
    const planQEndDateQ2 = {};
    carePlanQuery[`${FIELD.carePlanInfo}.${FIELD.planType}`] = 0;
    planQEndDateQ1[`${FIELD.carePlanInfo}.${FIELD.planEndDate}`] = { $exists: false };
    planQEndDateQ2[`${FIELD.carePlanInfo}.${FIELD.planEndDate}`] = { $in: [null, ''] };
    carePlanQuery.$or = [planQEndDateQ1, planQEndDateQ2];

    aggregate
      .match(query)
      .lookup({
        from: `${modelCodes.CASESTATUSHISTORY.slice(0, -1)}ies`,
        localField: FIELD._id,
        foreignField: FIELD.caseId,
        as: FIELD.caseStatusHistory,
      })
      .unwind({ path: `$${FIELD.caseStatusHistory}`, preserveNullAndEmptyArrays: true })
      .addFields(nowStatusFilter)
      .match(caseStatusQuery)
      .lookup({
        from: `${modelCodes.PERSON}s`,
        localField: FIELD.personId,
        foreignField: FIELD._id,
        as: FIELD.personInfo,
      })
      .unwind({ path: `$${FIELD.personInfo}`, preserveNullAndEmptyArrays: true })
      .match(queryName)
      .lookup({
        from: `${modelCodes.CAREPLAN}s`,
        localField: FIELD._id,
        foreignField: FIELD.caseId,
        as: FIELD.carePlanInfo,
      })
      .unwind({ path: `$${FIELD.carePlanInfo}`, preserveNullAndEmptyArrays: true })
      .match(carePlanQuery);
  }

  static async findCaseList(companyId = '', qbe = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.CASE);
    try {
      const aggregate = col.aggregate();
      await CaseRepository.aggregateCase(aggregate, companyId, qbe);
      await aggregate
        .project({
          _id: 1,
          personId: 1,
          caseNumber: 1,
          hc: 1,
          dc: 1,
          rc: 1,
          acm: 1,
          gh: 1,
          personInfo: 1,
          carePlanInfo: 1,
          createdAt: 1,
        })
        .sort(qbe.sort.replace(',', ' '))
        .skip(qbe.skip)
        .limit(qbe.limit);

      return aggregate;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Count all serviceItems by companyId and qbe.
   * @param {companyId} companyId Company id
   * @param {object} qbe query object
   * @returns {Promise.<Number>} return number of cases
   */
  static async countCaseListNumber(companyId = '', qbe = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.CASE);
    try {
      const aggregate = col.aggregate();
      await CaseRepository.aggregateCase(aggregate, companyId, qbe);
      await aggregate.project({ _id: 1 }).count(FIELD.count);

      return aggregate;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Find one case info.
   * @param {personId} personId Person id
   * @param {companyId} companyId Company id
   * @returns {Promise.<Number>} return number of cases
   */
  static async findCaseByPersonIdAndCompanyId(personId = '', companyId = '') {
    const col = DefaultDBClient.getCollection(modelCodes.CASE);
    const query = {
      personId: ObjectId(personId),
      companyId: ObjectId(companyId),
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
   * Find one case info.
   * @param {caseId} caseId Case id
   * @returns {Promise.<CaseEntity>} return caseEntity
   */
  static async findCase(caseId = '') {
    const col = DefaultDBClient.getCollection(modelCodes.CASE);
    if (!ObjectId.isValid(caseId)) {
      return undefined;
    }

    const query = {
      _id: ObjectId(caseId),
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

  static async findCaseByIds(ids) {
    const col = DefaultDBClient.getCollection(modelCodes.CASE);
    const _ids = [];
    ids.forEach((id) => {
      if (ObjectId.isValid(id)) { _ids.push(ObjectId(id)); }
    });

    const query = {
      _id: { $in: _ids },
    };
    try {
      const resList = await col.find(query).populate('personId').lean();
      const resArray = [];
      for (const data of resList) {
        resArray.push(_transformPopulatePerson(data));
      }
      return resArray;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Find case infos by personId.
   * @param {personId} personId Person id
   * @returns {Promise<Array<CaseEntity>>} return array of caseEntity
   */
  static async findCaseByPersonId(personId = '') {
    const col = DefaultDBClient.getCollection(modelCodes.CASE);
    let queryPerson;
    if (CustomValidator.nonEmptyString(personId)) {
      queryPerson = ObjectId(personId);
    } else if (CustomValidator.nonEmptyArray(personId)) {
      queryPerson = { $in: personId.map((p) => ObjectId(p)) };
    }
    const query = {
      personId: queryPerson,
      valid: true,
    };
    try {
      const resList = await col.find(query).lean();
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
   * Create one case info.
   * @param {CaseEntity} case entity
   * @returns {Promise.<CaseEntity>} return case entity
   */
  static async createCase(caseEntity = new CaseEntity(), session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.CASE);
    const obj = {
      personId: caseEntity.personId,
      companyId: caseEntity.companyId,
      hc: caseEntity.hc,
      dc: caseEntity.dc,
      rc: caseEntity.rc,
      acm: caseEntity.acm,
      gh: caseEntity.gh,
      valid: true,
      __cc: caseEntity.__cc,
      __sc: caseEntity.__sc,
      creator: ObjectId(caseEntity.creator),
    };
    try {
      const res = await col.create([obj], { session });
      caseEntity.bindObjectId(res[0]._id.toString());
      return caseEntity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Delete one case doc. by ObjectId (set valid is false)
   * @param {string} id DB ObjectId
   * @returns {boolean} return success or not
   */
  static async deleteById(id, basicInfo = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.CASE);
    const res = await commonDelete.deleteById(col, id, basicInfo.__cc, basicInfo.__sc);
    return res;
  }

  /**
   * Distinct companyId by personId
   * @param {string} personId person ID
   * @returns {boolean} return success or not
   */
  static async distinctByPersonId(personId = '') {
    const col = DefaultDBClient.getCollection(modelCodes.CASE);
    if (!ObjectId.isValid(personId)) return [];
    const query = {
      personId: ObjectId(personId),
      valid: true,
    };

    try {
      const res = await col.distinct('companyId', query);
      return res.map((p) => p.toString());
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Create one case info.
   * @param {CaseEntity} case entity
   * @returns {Promise.<CaseEntity>} return case entity
   */
  static async updateById(id, obj, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.CASE);
    const query = {
      _id: ObjectId(id),
      valid: true,
    };

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
}

module.exports = CaseRepository;
