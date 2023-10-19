/* eslint-disable no-return-assign */
/**
 * FeaturePath: Common-Repository--用藥紀錄
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-record-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-24 09:43:42 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const moment = require('moment');
const { ObjectId } = require('mongoose').Types;
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { MedicineRecordEntity, modelCodes, coreErrorCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new MedicineRecordEntity().bindDBObjectId(doc).bindObjectId(doc._id.toString());
  return entity;
}

function _prepareObj(entity) {
  if (!ObjectId.isValid(entity.companyId) || !ObjectId.isValid(entity.caseId)
    || !ObjectId.isValid(entity.workerId) || !ObjectId.isValid(entity.planId)) {
    throw new models.CustomError(coreErrorCodes.ERR_FIELD_OBJECT_ID_WRONG_FORMAT);
  }

  entity.medicines.forEach((m) => m.medicineId = ObjectId(m.medicineId));
  const obj = {
    companyId: ObjectId(entity.companyId),
    planId: ObjectId(entity.planId),
    planName: entity.planName,
    caseId: ObjectId(entity.caseId),
    caseName: entity.caseName,
    workerId: ObjectId(entity.workerId),
    workerName: entity.workerName,
    planStartDate: entity.planStartDate,
    planEndDate: entity.planEndDate,
    expectedUseTiming: entity.expectedUseTiming,
    expectedUseAt: entity.expectedUseAt,
    actualUseAt: entity.actualUseAt,
    status: entity.status ? entity.status : 0,
    medicines: entity.medicines,
    remark: entity.remark,
    __sc: entity.__sc,
    __cc: entity.__cc,
    __vn: 0,
  };

  if (ObjectId.isValid(entity.creator)) {
    obj.creator = ObjectId(entity.creator);
  }
  if (ObjectId.isValid(entity.modifier)) {
    obj.modifier = ObjectId(entity.modifier);
  }
  return obj;
}

class MedicineRecordRepository {
  static async create(entity, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINERECORD);
    const obj = _prepareObj(entity);

    try {
      const res = await col.create([obj], { session });
      entity.bindObjectId(res[0]._id.toString());
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async createMulti(entities, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINERECORD);
    const objs = entities.map((entity) => _prepareObj(entity));

    try {
      const resList = await col.create(objs, { session });
      entities.forEach((entity, index) => {
        entity.bindObjectId(resList[index]._id.toString());
      });
      return entities;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findByQBE(qbe) {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINERECORD);
    const query = {};
    if (CustomValidator.nonEmptyString(qbe.companyId) && ObjectId.isValid(qbe.companyId)) {
      query.companyId = ObjectId(qbe.companyId);
    }
    if (CustomValidator.nonEmptyString(qbe.caseId) && ObjectId.isValid(qbe.caseId)) {
      query.caseId = ObjectId(qbe.caseId);
    }
    if (CustomValidator.nonEmptyArray(qbe.caseIds)) {
      const caseList = [];
      qbe.caseIds.forEach((_caseId) => {
        if (ObjectId.isValid(_caseId)) { caseList.push(ObjectId(_caseId)); }
      });
      if (!query.caseId) {
        query.caseId = { $in: caseList };
      } else {
        const _list = CustomUtils.uniqueArray(query.caseId.concat(caseList));
        query.caseId = { $in: _list };
      }
    }
    if (CustomValidator.nonEmptyString(qbe.planName) && ObjectId.isValid(qbe.planName)) {
      query.planName = qbe.planName;
    }
    query.valid = true;

    if (CustomValidator.nonEmptyString(qbe.f)) {
      if (!query[qbe.filterDate]) {
        query[qbe.filterDate] = {};
      }
      query[qbe.filterDate].$gte = moment(qbe.f, 'YYYY/MM/DD').toDate();
    }
    if (CustomValidator.nonEmptyString(qbe.e)) {
      if (!query[qbe.filterDate]) {
        query[qbe.filterDate] = {};
      }
      query[qbe.filterDate].$lt = moment(qbe.e, 'YYYY/MM/DD').add(1, 'days').toDate();
    }
    if (CustomValidator.nonEmptyArray(qbe.status)) {
      query.status = { $in: qbe.status };
    }

    try {
      const resList = await col.find(query).sort(qbe.order).lean();
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

  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINERECORD);
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

  static async findByCaseIdAndDate(caseId, date, oneDay = false) {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINERECORD);
    const query = {
      caseId: ObjectId(caseId),
      expectedUseAt: {
        $gte: moment(date, 'YYYY/MM/DD').toDate(),
      },
      valid: true,
    };
    if (oneDay) {
      // 只更新一天
      query.expectedUseAt.$lt = moment(date, 'YYYY/MM/DD').add(1, 'days').toDate();
    }

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

  static async update(id, entity, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINERECORD);
    const query = {
      _id: ObjectId(id),
      valid: true,
    };

    entity.medicines.forEach((m) => m.medicineId = ObjectId(m.medicineId));
    if (!ObjectId.isValid(entity.workerId)) {
      throw new models.CustomError(coreErrorCodes.ERR_FIELD_OBJECT_ID_WRONG_FORMAT);
    }
    const obj = {
      workerId: ObjectId(entity.workerId),
      workerName: entity.workerName,
      actualUseAt: entity.actualUseAt,
      status: entity.status,
      medicines: entity.medicines,
      remark: entity.remark,
      __sc: entity.__sc,
      __cc: entity.__cc,
    };
    if (ObjectId.isValid(entity.modifier)) {
      obj.modifier = ObjectId(entity.modifier);
    }

    try {
      const res = await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } }, { session });
      if (res.n !== 1 && res.nModified !== 1) {
        throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
      }
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async updateStatusByCaseIdAndDate(caseId, startDate, endDate, status, baseInfo, modifier, oneDay = false) {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINERECORD);
    const query = {
      caseId: ObjectId(caseId),
      expectedUseAt: {
        $gte: moment(startDate, 'YYYY/MM/DD').toDate(),
      },
      valid: true,
    };
    // 三種情境: (1)startDate-endDate (2)only startDate (3)startDate->
    if (endDate) {
      // 有結束日期: 情境(1)
      query.expectedUseAt.$lt = moment(endDate, 'YYYY/MM/DD').add(1, 'days').toDate();
    } else if (oneDay) {
      // 只更新一天: 情境(2)
      query.expectedUseAt.$lt = moment(startDate, 'YYYY/MM/DD').add(1, 'days').toDate();
    }

    const obj = {
      status,
      __cc: baseInfo.__cc,
      __sc: baseInfo.__sc,
    };
    if (ObjectId.isValid(modifier)) {
      obj.modifier = ObjectId(modifier);
    }

    try {
      const res = await col.updateMany(query, { $set: obj, $inc: { __vn: 1 } }).lean();
      return res.nModified;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async updateMultiStatus(objArray, baseInfo = {}, modifier = '') {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINERECORD);
    const bulkArray = objArray.map((obj) => ({
      updateOne: {
        filter: { _id: ObjectId(obj.id) },
        update: {
          $set: {
            status: obj.status,
            __cc: baseInfo.__cc,
            __sc: baseInfo.__sc,
          },
          $inc: { __vn: 1 },
        },
      },
    }));
    if (ObjectId.isValid(modifier)) {
      bulkArray.forEach((bulk) => {
        bulk.updateOne.update.$set.modifier = ObjectId(modifier);
      });
    }

    try {
      const res = await col.bulkWrite(bulkArray);
      return res.modifiedCount;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * @param {array} planIds
   * @param {boolean} keepHasRecorded keep the record has recorded (actualUseAt has data)
   * @param {object} baseInfo __cc, __sc
   * @param {string} modifier ObjectId
   * @param {import('mongoose').ClientSession} session
   * @returns Boolean
   */
  static async deleteByPlanIds(planIds, keepHasRecorded = false, baseInfo = {}, modifier = '', session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINERECORD);

    const ids = [];
    planIds.forEach((id) => {
      if (ObjectId.isValid(id)) { ids.push(ObjectId(id)); }
    });

    const query = {
      planId: { $in: ids },
      valid: true,
    };
    if (keepHasRecorded) {
      query.$or = [
        { actualUseAt: { $in: [null, ''] } },
        { actualUseAt: { $exists: false } }
      ];
    }

    const obj = {
      valid: false,
      __cc: baseInfo.__cc,
      __sc: baseInfo.__sc,
    };
    if (ObjectId.isValid(modifier)) {
      obj.modifier = ObjectId(modifier);
    }

    try {
      const res = await col.updateMany(query, { $set: obj, $inc: { __vn: 1 } }, { session }).lean();
      return res.nModified;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async deleteByCaseAndFromDate(caseId, date, baseInfo = {}, modifier = '') {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINERECORD);
    const query = {
      caseId: ObjectId(caseId),
      expectedUseAt: { $gte: moment(date, 'YYYY/MM/DD').toDate() },
      valid: true,
    };

    const obj = {
      valid: false,
      __cc: baseInfo.__cc,
      __sc: baseInfo.__sc,
    };
    if (ObjectId.isValid(modifier)) {
      obj.modifier = ObjectId(modifier);
    }

    try {
      const res = await col.updateMany(query, { $set: obj, $inc: { __vn: 1 } }).lean();
      return res.nModified;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async deleteByCaseAndExpectedUseAt(caseId, expectedUseAtStartAt, expectedUseAtEndAt, baseInfo = {}, modifier = '') {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINERECORD);
    const query = {
      caseId: ObjectId(caseId),
      expectedUseAt: {
        $gte: moment(expectedUseAtStartAt, 'YYYY/MM/DD HH:mm').toDate(),
        $lt: moment(expectedUseAtEndAt, 'YYYY/MM/DD HH:mm').add(1, 'minute').toDate(),
      },
      valid: true,
    };

    const obj = {
      valid: false,
      __cc: baseInfo.__cc,
      __sc: baseInfo.__sc,
    };
    if (ObjectId.isValid(modifier)) {
      obj.modifier = ObjectId(modifier);
    }

    try {
      const res = await col.updateMany(query, { $set: obj, $inc: { __vn: 1 } }).lean();
      return res.nModified;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = MedicineRecordRepository;
