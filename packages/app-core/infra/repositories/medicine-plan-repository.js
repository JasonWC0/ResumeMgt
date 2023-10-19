/* eslint-disable no-return-assign */
/**
 * FeaturePath: Common-Repository--用藥計畫
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: medicine-plan-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-15 10:00:28 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const moment = require('moment');
const { ObjectId } = require('mongoose').Types;
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { MedicinePlanEntity, modelCodes, coreErrorCodes } = require('../../domain');
const commonDelete = require('./common-function/delete');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new MedicinePlanEntity().bindDBObjectId(doc).bindObjectId(doc._id.toString());
  return entity;
}

class MedicinePlanRepository {
  static async create(entity, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINEPLAN);
    if (!ObjectId.isValid(entity.companyId) || !ObjectId.isValid(entity.caseId) || !ObjectId.isValid(entity.workerId)) {
      throw new models.CustomError(coreErrorCodes.ERR_FIELD_OBJECT_ID_WRONG_FORMAT);
    }

    entity.medicines.forEach((m) => m.medicineId = ObjectId(m.medicineId));
    const obj = {
      companyId: ObjectId(entity.companyId),
      caseId: ObjectId(entity.caseId),
      caseName: entity.caseName,
      planName: entity.planName,
      workerId: ObjectId(entity.workerId),
      workerName: entity.workerName,
      hospital: entity.hospital,
      doctor: entity.doctor,
      planStartDate: entity.planStartDate,
      planEndDate: entity.planEndDate,
      medicines: entity.medicines,
      remark: entity.remark,
      images: entity.images,
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

    try {
      const res = await col.create([obj], { session });
      entity.bindObjectId(res[0]._id.toString());
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async updateById(id, entity, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINEPLAN);
    if (!ObjectId.isValid(entity.workerId)) {
      throw new models.CustomError(coreErrorCodes.ERR_FIELD_OBJECT_ID_WRONG_FORMAT);
    }

    const query = {
      _id: ObjectId(id),
      valid: true,
    };

    entity.medicines.forEach((m) => m.medicineId = ObjectId(m.medicineId));
    const obj = {
      caseName: entity.caseName,
      planName: entity.planName,
      workerId: ObjectId(entity.workerId),
      workerName: entity.workerName,
      hospital: entity.hospital,
      doctor: entity.doctor,
      planStartDate: entity.planStartDate,
      planEndDate: entity.planEndDate,
      medicines: entity.medicines,
      remark: entity.remark,
      images: entity.images,
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

  static async findByQBE(qbe) {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINEPLAN);
    const query = {};
    if (CustomValidator.nonEmptyString(qbe.companyId) && ObjectId.isValid(qbe.companyId)) {
      query.companyId = ObjectId(qbe.companyId);
    }
    if (CustomValidator.nonEmptyString(qbe.caseId) && ObjectId.isValid(qbe.caseId)) {
      query.caseId = ObjectId(qbe.caseId);
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
    if (CustomValidator.nonEmptyString(qbe.scheduleDate)) {
      query.planStartDate = {
        $lte: moment(qbe.scheduleDate).toDate(),
      };
      query.planEndDate = {
        $gte: moment(qbe.scheduleDate).toDate(),
      };
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
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINEPLAN);
    if (!ObjectId.isValid(id)) { return undefined; }
    const query = {
      _id: ObjectId(id),
      valid: true,
    };

    try {
      const res = await col.findOne(query).populate('medicines.medicineId').lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async deleteById(id, baseInfo = {}, modifier = '', session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.MEDICINEPLAN);
    const res = await commonDelete.deleteById(col, id, baseInfo.__cc, baseInfo.__sc, modifier, session);
    return res;
  }
}

module.exports = MedicinePlanRepository;
