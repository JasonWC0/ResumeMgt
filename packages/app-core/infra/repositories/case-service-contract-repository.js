/**
 * FeaturePath: Common-Repository--個案合約
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-service-contract-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-12-05 11:31:38 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');
const { ObjectId } = require('mongoose').Types;
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const {
  PersonEntity, CaseServiceContractEntity, modelCodes, companyServiceCodes,
} = require('../../domain');
const commonDelete = require('./common-function/delete');

const ROOT = 'ROOT';
const _id = '_id';
const DATE_FORMAT = 'YYYY/MM/DD';
const SERVICE_ANCHOR = '{SERVICE}';
const CONTRACTS_NAME = 'contracts';
const HAS_CONTRACT_NAME = `has${SERVICE_ANCHOR}Contract`;
const CASE_CONTRACT_NAME = 'caseContract';
const CONTRACT_COUNT_NAME = 'contractCount';
const COUNT_DOC_NAME = 'countDocuments';
const CONTRACT_COUNT_FIELD = {
  service: 'service',
  count: 'count',
};
const CONTRACT_FIELD = {
  caseId: 'caseId',
  valid: 'valid',
  startDate: 'startDate',
  endDate: 'endDate',
  principal: 'principal',
  service: 'service',
};
const CASE_FIELD = {
  personId: 'personId',
  personInfo: 'personInfo',
  hc: 'hc',
  dc: 'dc',
  rc: 'rc',
  createdAt: 'createdAt',
  valid: 'valid',
};

/**
 * Document轉Entity
 * @param {Document} doc DB Document
 * @returns {CaseServiceContractEntity}
 */
function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  return new CaseServiceContractEntity()
    .bindObjectId(doc._id.toString())
    .bindDB(doc);
}

/**
 * Case base Document
 * @param {Object} doc DB Document
 * @returns {Object} id
 */
function _transformMixDoc(doc) {
  if (!doc) {
    return undefined;
  }

  const _doc = {};
  // 整理個案&人員資料
  _doc.id = doc._id.caseId.toString();
  _doc.hc = (doc.hc && doc.hc.valid) ? doc.hc : null;
  _doc.dc = (doc.dc && doc.dc.valid) ? doc.dc : null;
  _doc.rc = (doc.rc && doc.rc.valid) ? doc.rc : null;
  _doc.personInfo = doc.personInfo ? new PersonEntity().bind(doc.personInfo).bindObjectId(doc.personInfo._id.toString()).bindCorpId(doc.personInfo.corpId.toString()) : null;

  // 整理合約資料
  if (CustomValidator.nonEmptyArray(doc.contracts) && doc.contracts.length === 1 && !CustomValidator.nonEmptyArray(doc.contracts[0])) {
    doc.contracts = [];
  }
  doc.contracts.forEach((serviceArr, index1) => {
    serviceArr.forEach((c, index2) => {
      doc.contracts[index1][index2] = _transform(c);
    });
  });
  _doc.contracts = doc.contracts.filter((c) => CustomValidator.nonEmptyArray(c));

  // 整併合約統計
  const contractCount = {};
  doc.contractCount.forEach((c) => {
    if (JSON.stringify(Object.keys(c).sort()) === JSON.stringify(Object.values(CONTRACT_COUNT_FIELD).sort())) {
      contractCount[c[CONTRACT_COUNT_FIELD.service]] = c[CONTRACT_COUNT_FIELD.count];
    }
  });
  _doc.contractCount = contractCount;
  _doc.createdAt = doc.createdAt;
  return _doc;
}

/**
 * 組成個案查詢條件 aggregate
 * @param {String[]} qbe.service 服務類型列表
 * @param {String} qbe.caseName 個案姓名
 * @return {Object, Object} 個案查詢條件, 姓名查詢條件
 */
async function _prepareCaseQuery(qbe = {}) {
  const query = {
    companyId: ObjectId(qbe.companyId),
    $and: [],
    valid: true,
  };
  const qServiceCategoryAry = [];
  if (CustomValidator.nonEmptyArray(qbe.service)) {
    qbe.service
      .forEach((sc) => {
        if (!Object.values(companyServiceCodes).includes(sc)) return;
        const q = {};
        q[`${sc.toLowerCase()}.valid`] = true;
        qServiceCategoryAry.push(q);
      });
  }
  if (CustomValidator.nonEmptyArray(qServiceCategoryAry)) {
    query.$and.push({ $or: qServiceCategoryAry });
  }

  let nameQuery = {};
  if (CustomValidator.nonEmptyString(qbe.caseName)) {
    let hn = '';
    for await (const c of qbe.caseName) {
      hn += (await CustomUtils.hashedWithSalt(c)).substring(0, 8);
    }
    nameQuery = { 'personInfo.hashName': { $regex: hn } };
  }
  return { caseQuery: query, nameQuery };
}

/**
 * 組成"個案為基礎"合約查詢條件 aggregate
 * @param {String} qbe.principal 聯絡人姓名
 * @param {String} qbe.sDateF 合約開始日期，查詢區間開始日 YYYY/MM/DD
 * @param {String} qbe.sDateE 合約開始日期，查詢區間結束日 YYYY/MM/DD
 * @param {String} qbe.eDateF 合約結束日期，查詢區間開始日 YYYY/MM/DD
 * @param {String} qbe.eDateE 合約結束日期，查詢區間結束日 YYYY/MM/DD
 * @return {Object} 查詢條件
 */
function _prepareCaseBaseQuery(qbe = {}) {
  const query = {};

  if (CustomValidator.nonEmptyString(qbe.principal)) {
    query[`${CASE_CONTRACT_NAME}.${CONTRACT_FIELD.principal}`] = { $regex: qbe.principal };
  }
  if (CustomValidator.nonEmptyString(qbe.sDateF) && CustomValidator.nonEmptyString(qbe.sDateE)) {
    query[`${CASE_CONTRACT_NAME}.${CONTRACT_FIELD.startDate}`] = {
      $gte: moment(qbe.sDateF, DATE_FORMAT).toDate(),
      $lt: moment(qbe.sDateE, DATE_FORMAT).add(1, 'd').toDate(),
    };
  }
  if (CustomValidator.nonEmptyString(qbe.eDateF) && CustomValidator.nonEmptyString(qbe.eDateE)) {
    query[`${CASE_CONTRACT_NAME}.${CONTRACT_FIELD.endDate}`] = {
      $gte: moment(qbe.eDateF, DATE_FORMAT).toDate(),
      $lt: moment(qbe.eDateE, DATE_FORMAT).add(1, 'd').toDate(),
    };
  }
  return query;
}

/**
 * 組成合約是否上傳查詢條件 aggregate
 * @param {Boolean} qbe.hasHCContract 是否上傳居家式合約
 * @param {Boolean} qbe.hasDCContract 是否上傳社區式合約
 * @param {Boolean} qbe.hasRCContract 是否上傳住宿式合約
 * @return {Object} 查詢條件
 */
function _prepareHasContractQuery(qbe = {}) {
  const query = {};
  if (CustomValidator.isBoolean(qbe.hasHCContract) || CustomValidator.isBoolean(qbe.hasDCContract) || CustomValidator.isBoolean(qbe.hasRCContract)) {
    query.$and = [];
    const serviceList = [companyServiceCodes.HC, companyServiceCodes.DC, companyServiceCodes.RC];
    serviceList.forEach((service) => {
      const key = CustomUtils.deepCopy(`${HAS_CONTRACT_NAME}`).replace(SERVICE_ANCHOR, service);
      if (CustomValidator.isBoolean(qbe[key])) {
        let obj;
        if (qbe[key]) {
          obj = {};
          obj[`${CONTRACT_COUNT_NAME}.${CONTRACT_COUNT_FIELD.service}`] = service;
          obj[`${CONTRACT_COUNT_NAME}.${CONTRACT_COUNT_FIELD.count}`] = { $gt: 0 };
        } else {
          obj = { $or: [] };
          const exp1 = {};
          const exp2 = { $and: [] };
          exp1[`${CONTRACT_COUNT_NAME}.${CONTRACT_COUNT_FIELD.service}`] = { $ne: service };
          obj.$or.push(exp1);
          const exp2Child1 = {};
          const exp2Child2 = {};
          exp2Child1[`${CONTRACT_COUNT_NAME}.${CONTRACT_COUNT_FIELD.service}`] = service;
          exp2Child2[`${CONTRACT_COUNT_NAME}.${CONTRACT_COUNT_FIELD.count}`] = { $eq: 0 };
          exp2.$and.push(exp2Child1);
          exp2.$and.push(exp2Child2);
          obj.$or.push(exp2);
        }
        query.$and.push(obj);
      }
    });
  }
  return query;
}

/**
 * 組成以個案為基礎的aggregate
 * @param {Object} aggregate mongo aggregate
 * @param {String[]} qbe.service 服務類型列表
 * @param {String} qbe.caseName 個案姓名
 * @param {String} qbe.principal 委託人姓名
 * @param {String} qbe.sDateF 合約開始日期，查詢區間開始日 YYYY/MM/DD
 * @param {String} qbe.sDateE 合約開始日期，查詢區間結束日 YYYY/MM/DD
 * @param {String} qbe.eDateF 合約結束日期，查詢區間開始日 YYYY/MM/DD
 * @param {String} qbe.eDateE 合約結束日期，查詢區間結束日 YYYY/MM/DD
 * @param {Boolean} qbe.hcHasContract 居家式上傳合約
 * @param {Boolean} qbe.dcHasContract 社區式上傳合約
 * @param {Boolean} qbe.rcHasContract 住宿式上傳合約
 * @param {String} qbe.caseOrder 個案排列順序
 * @param {String} qbe.contractOrder 合約排列順序
 */
async function _aggregateByCase(aggregate, qbe = {}) {
  const { caseQuery, nameQuery } = await _prepareCaseQuery(qbe);
  const caseContractQuery = _prepareCaseBaseQuery(qbe);
  const hasContractQuery = _prepareHasContractQuery(qbe);

  const contractSort = qbe.contractOrder;
  const caseSort = qbe.caseOrder;
  aggregate
    .match(caseQuery)
    .lookup({
      from: `${modelCodes.PERSON}s`,
      localField: `${CASE_FIELD.personId}`,
      foreignField: _id,
      as: `${CASE_FIELD.personInfo}`,
    })
    .unwind({ path: `$${CASE_FIELD.personInfo}`, preserveNullAndEmptyArrays: true })
    .match(nameQuery)
    .lookup({
      from: `${modelCodes.CASESERVICECONTRACT}s`,
      localField: _id,
      foreignField: `${CONTRACT_FIELD.caseId}`,
      as: `${CASE_CONTRACT_NAME}`,
    })
    .unwind({ path: `$${CASE_CONTRACT_NAME}`, preserveNullAndEmptyArrays: true })
    .sort(contractSort)
    .match(caseContractQuery)
    .group({
      _id: {
        caseId: `$${_id}`,
        service: `$${CASE_CONTRACT_NAME}.${CONTRACT_COUNT_FIELD.service}`,
      },
      contracts: { $push: `$${CASE_CONTRACT_NAME}` },
      personInfo: { $first: `$${CASE_FIELD.personInfo}` },
      hc: { $first: `$${CASE_FIELD.hc}` },
      dc: { $first: `$${CASE_FIELD.dc}` },
      rc: { $first: `$${CASE_FIELD.rc}` },
      createdAt: { $first: `$${CASE_FIELD.createdAt}` },
    })
    .project({
      _id: 1,
      contracts: {
        $filter: {
          input: `$${CONTRACTS_NAME}`,
          as: CONTRACTS_NAME,
          cond: { $eq: [`$$${CONTRACTS_NAME}.${CONTRACT_FIELD.valid}`, true] },
        },
      },
      personInfo: 1,
      hc: 1,
      dc: 1,
      rc: 1,
      createdAt: 1,
    })
    .addFields({
      count: { $size: `$${CONTRACTS_NAME}` },
    })
    .group({
      _id: {
        caseId: `$${_id}.${CONTRACT_FIELD.caseId}`,
      },
      contracts: { $addToSet: `$${CONTRACTS_NAME}` },
      contractCount: {
        $push: {
          service: `$${_id}.${CONTRACT_COUNT_FIELD.service}`,
          count: `$${CONTRACT_COUNT_FIELD.count}`,
        },
      },
      personInfo: { $first: `$${CASE_FIELD.personInfo}` },
      hc: { $first: `$${CASE_FIELD.hc}` },
      dc: { $first: `$${CASE_FIELD.dc}` },
      rc: { $first: `$${CASE_FIELD.rc}` },
      createdAt: { $first: `$${CASE_FIELD.createdAt}` },
    })
    .match(hasContractQuery)
    .sort(caseSort);
}

/**
 * 組成合約查詢條件
 * @param {String} qbe.companyId 機構ObjectId
 * @param {String[]} qbe.caseId 個案ObjectId列表
 * @param {String} qbe.principal 聯絡人姓名
 * @param {String} qbe.sDateF 合約開始日期，查詢區間開始日 YYYY/MM/DD
 * @param {String} qbe.sDateE 合約開始日期，查詢區間結束日 YYYY/MM/DD
 * @param {String} qbe.eDateF 合約結束日期，查詢區間開始日 YYYY/MM/DD
 * @param {String} qbe.eDateE 合約結束日期，查詢區間結束日 YYYY/MM/DD
 * @returns {Object} 查詢條件
 */
function _prepareQuery(qbe = {}) {
  const query = {
    companyId: ObjectId(qbe.companyId),
    valid: true,
  };

  if (CustomValidator.nonEmptyArray(qbe.caseId)) {
    query.caseId = { $in: qbe.caseId.map((c) => ObjectId(c)) };
  }
  if (CustomValidator.nonEmptyString(qbe.principal)) {
    query.principal = { $regex: qbe.principal };
  }
  if (CustomValidator.nonEmptyString(qbe.sDateF) && CustomValidator.nonEmptyString(qbe.sDateE)) {
    query.startDate = {
      $gte: moment(qbe.sDateF, DATE_FORMAT).toDate(),
      $lt: moment(qbe.sDateE, DATE_FORMAT).add(1, 'd').toDate(),
    };
  }
  if (CustomValidator.nonEmptyString(qbe.eDateF) && CustomValidator.nonEmptyString(qbe.eDateE)) {
    query.endDate = {
      $gte: moment(qbe.eDateF, DATE_FORMAT).toDate(),
      $lt: moment(qbe.eDateE, DATE_FORMAT).add(1, 'd').toDate(),
    };
  }
  return query;
}

/**
 * 組成寫入物件
 * @param {CaseServiceContractEntity} entity 個案合約entity
 * @returns {Object} 寫入物件
 */
function _prepareObj(entity) {
  const obj = {
    service: entity.service,
    principal: entity.principal,
    startDate: entity.startDate,
    endDate: entity.endDate,
    file: entity.file,
    __cc: entity.__cc,
    __sc: entity.__sc,
    valid: true,
  };
  if (ObjectId.isValid(entity.modifier)) {
    obj.modifier = ObjectId(entity.modifier);
  }
  return obj;
}

class CaseServiceContractRepository {
  /**
   * 建立個案合約
   * @param {CaseServiceContractEntity} entity 個案合約entity
   * @returns {Promise.<CaseServiceContractEntity>} return CaseServiceContractEntity
   */
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.CASESERVICECONTRACT);
    const obj = _prepareObj(entity);
    obj.companyId = ObjectId(entity.companyId);
    obj.caseId = ObjectId(entity.caseId);
    obj.clientDomain = entity.clientDomain;
    obj.__vn = 0;
    if (ObjectId.isValid(entity.creator)) {
      obj.creator = ObjectId(entity.creator);
    }
    try {
      const res = await col.create(obj);
      return entity.bindObjectId(res._id.toString());
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * 編輯個案合約(By id)
   * @param {String} id 個案合約ObjectId
   * @param {CaseServiceContractEntity} entity 個案合約entity
   * @returns {Promise.<CaseServiceContractEntity>} return CaseServiceContractEntity
   */
  static async updateById(id, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.CASESERVICECONTRACT);
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
   * 查詢個案合約(By id)
   * @param {String} id 個案合約ObjectId
   * @returns {Promise.<CaseServiceContractEntity>} return CaseServiceContractEntity
   */
  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.CASESERVICECONTRACT);
    if (!ObjectId.isValid(id)) { return undefined; }
    const query = {
      _id: ObjectId(id),
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
   * 以個案為基底的查詢個案合約(By 條件)
   * @param {String[]} qbe.service 服務類型列表
   * @param {String} qbe.caseName 個案姓名
   * @param {String} qbe.principal 委託人姓名
   * @param {String} qbe.sDateF 合約開始日期，查詢區間開始日 YYYY/MM/DD
   * @param {String} qbe.sDateE 合約開始日期，查詢區間結束日 YYYY/MM/DD
   * @param {String} qbe.eDateF 合約結束日期，查詢區間開始日 YYYY/MM/DD
   * @param {String} qbe.eDateE 合約結束日期，查詢區間結束日 YYYY/MM/DD
   * @param {Boolean} qbe.hcHasContract 居家式上傳合約
   * @param {Boolean} qbe.dcHasContract 社區式上傳合約
   * @param {Boolean} qbe.rcHasContract 住宿式上傳合約
   * @param {Number} qbe.skip 分頁用，略過筆數
   * @param {Number} qbe.limit 分頁用，每次取出筆數
   * @param {String} qbe.caseOrder 個案排列順序
   * @param {String} qbe.contractOrder 合約排列順序
   * @returns {Object[]} 個案為主的合約資料列表
   */
  static async findByCaseBaseQBE(qbe = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.CASE);
    try {
      const aggregate = col.aggregate();
      await _aggregateByCase(aggregate, qbe);
      const resList = await aggregate
        .skip(qbe.skip)
        .limit(qbe.limit);

      const resArray = [];
      for (const data of resList) {
        resArray.push(_transformMixDoc(data));
      }
      return resArray;
      // return resList;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * 以個案為基底的查詢個案合約數量(By 條件)
   * @param {String[]} qbe.service 服務類型列表
   * @param {String} qbe.caseName 個案姓名
   * @param {String} qbe.principal 委託人姓名
   * @param {String} qbe.sDateF 合約開始日期，查詢區間開始日 YYYY/MM/DD
   * @param {String} qbe.sDateE 合約開始日期，查詢區間結束日 YYYY/MM/DD
   * @param {String} qbe.eDateF 合約結束日期，查詢區間開始日 YYYY/MM/DD
   * @param {String} qbe.eDateE 合約結束日期，查詢區間結束日 YYYY/MM/DD
   * @param {Boolean} qbe.hcHasContract 居家式上傳合約
   * @param {Boolean} qbe.dcHasContract 社區式上傳合約
   * @param {Boolean} qbe.rcHasContract 住宿式上傳合約
   * @param {String} qbe.caseOrder 個案排列順序
   * @param {String} qbe.contractOrder 合約排列順序
   * @returns {Number} return count
   */
  static async countByCaseBaseQBE(qbe = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.CASE);
    try {
      const aggregate = col.aggregate();
      await _aggregateByCase(aggregate, qbe);
      const result = await aggregate
        .count(COUNT_DOC_NAME);
      return CustomValidator.nonEmptyArray(result) ? result[0]?.[COUNT_DOC_NAME] : 0;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * 查詢個案合約(By 條件)
   * @param {String} qbe.companyId 機構ObjectId
   * @param {String[]} qbe.caseId 個案ObjectId列表
   * @param {String} qbe.principal 聯絡人姓名
   * @param {String} qbe.sDateF 合約開始日期，查詢區間開始日 YYYY/MM/DD
   * @param {String} qbe.sDateE 合約開始日期，查詢區間結束日 YYYY/MM/DD
   * @param {String} qbe.eDateF 合約結束日期，查詢區間開始日 YYYY/MM/DD
   * @param {String} qbe.eDateE 合約結束日期，查詢區間結束日 YYYY/MM/DD
   * @param {Object} qbe.contractOrder 合約排列順序
   * @returns {Object[]} 個案為主的合約資料列表
   */
  static async findByQBE(qbe = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.CASESERVICECONTRACT);
    const query = _prepareQuery(qbe);
    const contractSort = qbe.contractOrder;

    try {
      const aggregate = col.aggregate();
      const resList = await aggregate
        .match(query)
        .sort(contractSort)
        .group({
          _id: {
            caseId: `$${CONTRACT_FIELD.caseId}`,
            service: `$${CONTRACT_FIELD.service}`,
          },
          contracts: {
            $push: `$$${ROOT}`,
          },
          count: { $sum: 1 },
        })
        .group({
          _id: {
            caseId: `$${_id}.${CONTRACT_FIELD.caseId}`,
          },
          contracts: { $addToSet: `$${CONTRACTS_NAME}` },
          contractCount: {
            $push: {
              service: `$${_id}.${CONTRACT_COUNT_FIELD.service}`,
              count: `$${CONTRACT_COUNT_FIELD.count}`,
            },
          },
        });

      const resArray = [];
      for (const data of resList) {
        resArray.push(_transformMixDoc(data));
      }
      return resArray;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * 刪除個案合約
   * @param {String} id 個案合約ObjectId
   * @returns {Boolean} 刪除與否
   */
  static async deleteById(id, baseInfo = {}, modifier = '') {
    const col = DefaultDBClient.getCollection(modelCodes.CASESERVICECONTRACT);
    const res = await commonDelete.deleteById(col, id, baseInfo.__cc, baseInfo.__sc, modifier);
    return res;
  }
}

module.exports = CaseServiceContractRepository;
