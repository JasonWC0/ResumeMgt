/* eslint-disable consistent-return */
/**
 * FeaturePath: Common-Repository--護理排班
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: nursing-shift-schedule-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-10-24 12:00:34 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');
const { ObjectId } = require('mongoose').Types;
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { NursingShiftScheduleEntity, modelCodes } = require('../../domain');
const commonDelete = require('./common-function/delete');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new NursingShiftScheduleEntity().bindDBObjectId(doc).bindObjectId(doc._id.toString());
  return entity;
}
function _prepareObj(entity) {
  if (!ObjectId.isValid(entity.companyId) || !ObjectId.isValid(entity.personId) || !ObjectId.isValid(entity.nursingShift.nursingShiftId)) { throw new models.CustomError(codes.errorCodes.ERR_FIELD_OBJECT_ID_WRONG_FORMAT); }

  const obj = {
    date: entity.date,
    companyId: ObjectId(entity.companyId),
    personId: ObjectId(entity.personId),
    startedAt: entity.startedAt,
    endedAt: entity.endedAt,
    nursingShift: {
      nursingShiftId: ObjectId(entity.nursingShift.nursingShiftId),
      code: entity.nursingShift.code,
      name: entity.nursingShift.name,
      startedAt: entity.nursingShift.startedAt,
      endedAt: entity.nursingShift.endedAt,
      isDayOff: entity.nursingShift.isDayOff,
    },
    __vn: 0,
    __cc: entity.__cc,
    __sc: entity.__sc,
    valid: true,
  };
  if (ObjectId.isValid(entity.creator)) {
    obj.creator = ObjectId(entity.creator);
  }
  if (ObjectId.isValid(entity.modifier)) {
    obj.modifier = ObjectId(entity.modifier);
  }
  return obj;
}

class NursingShiftScheduleRepository {
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.NURSINGSHIFTSCHEDULE);
    const obj = _prepareObj(entity);

    try {
      const res = await col.create(obj);
      entity.bindObjectId(res._id.toString());
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async createMulti(entities, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.NURSINGSHIFTSCHEDULE);
    const objs = entities.map((entity) => (_prepareObj(entity)));
    try {
      const res = await col.insertMany(objs, { session });
      return res;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async updateById(id, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.NURSINGSHIFTSCHEDULE);
    const query = {
      _id: ObjectId(id),
      valid: true,
    };
    const obj = {
      startedAt: entity.startedAt,
      endedAt: entity.endedAt,
      nursingShift: {
        nursingShiftId: ObjectId(entity.nursingShift.nursingShiftId),
        code: entity.nursingShift.code,
        name: entity.nursingShift.name,
        startedAt: entity.nursingShift.startedAt,
        endedAt: entity.nursingShift.endedAt,
        isDayOff: entity.nursingShift.isDayOff,
      },
      __cc: entity.__cc,
      __sc: entity.__sc,
    };
    if (CustomValidator.nonEmptyArray(entity.employeeLeaveHistoryIds)) {
      const _hIds = [];
      entity.employeeLeaveHistoryIds.forEach((employeeLeaveHistoryId) => {
        if (!ObjectId.isValid(employeeLeaveHistoryId)) { throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL); }
        _hIds.push(ObjectId(employeeLeaveHistoryId));
      });
      obj.employeeLeaveHistoryIds = _hIds;
    }
    if (ObjectId.isValid(entity.modifier)) {
      obj.modifier = ObjectId(entity.modifier);
    }

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

  static async updateMulti(objArray, baseInfo = {}, modifier = '', session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.NURSINGSHIFTSCHEDULE);
    const bulkArray = objArray.map((obj) => ({
      updateOne: {
        filter: { _id: ObjectId(obj.id) },
        update: {
          $set: {
            startedAt: obj.startedAt,
            endedAt: obj.endedAt,
            nursingShift: {
              nursingShiftId: ObjectId(obj.nursingShift.nursingShiftId),
              code: obj.nursingShift.code,
              name: obj.nursingShift.name,
              startedAt: obj.nursingShift.startedAt,
              endedAt: obj.nursingShift.endedAt,
              isDayOff: obj.nursingShift.isDayOff,
            },
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
      const res = await col.bulkWrite(bulkArray, { session });
      return res.modifiedCount;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.NURSINGSHIFTSCHEDULE);
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

  static async findByQbe(qbe = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.NURSINGSHIFTSCHEDULE);
    const query = {};
    if (ObjectId.isValid(qbe.companyId)) { query.companyId = ObjectId(qbe.companyId); }
    if (CustomValidator.isNumber(qbe.year) && CustomValidator.isNumber(qbe.month)) {
      const _m = moment().set('year', qbe.year).set('month', qbe.month - 1);
      query.date = {
        $gte: _m.startOf('month').toDate(),
        $lte: _m.endOf('month').toDate(),
      };
    } else if (CustomValidator.nonEmptyArray(qbe.dates)) {
      query.date = { $in: qbe.dates };
    } else if (qbe.fromStartDate && qbe.fromEndDate) {
      query.date = {
        $gte: qbe.fromStartDate,
        $lte: qbe.fromEndDate,
      };
    } else if (qbe.date) {
      query.date = qbe.date;
    }
    if (ObjectId.isValid(qbe.personId)) { query.personId = ObjectId(qbe.personId); }
    if (CustomValidator.nonEmptyArray(qbe.personIds)) {
      const _list = qbe.personIds.filter((p) => ObjectId.isValid(p)).forEach((p) => ObjectId(p));
      query.personId = { $in: _list };
    }
    query.valid = true;
    if (CustomValidator.isBoolean(qbe.isDayOff)) { query['nursingShift.isDayOff'] = qbe.isDayOff; }
    if (qbe.startedAt) { query.startedAt = qbe.startedAt; }
    if (qbe.endedAt) { query.endedAt = qbe.endedAt; }
    if (qbe.$or) { query.$or = qbe.$or; }
    if (ObjectId.isValid(qbe.nursingShiftId)) { query['nursingShift.nursingShiftId'] = ObjectId(qbe.nursingShiftId); }
    if (qbe.employeeLeaveHistoryIds) { query.employeeLeaveHistoryIds = qbe.employeeLeaveHistoryId; }

    try {
      const resList = await col.find(query).sort({ date: 1 }).populate({ path: 'employeeLeaveHistoryIds', match: {} }).lean();
      if (!resList) { return undefined; }

      const resArray = [];
      for (const res of resList) {
        resArray.push(_transform(res));
      }
      return resArray;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async deleteByIds(ids, baseInfo = {}, modifier = '', session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.NURSINGSHIFTSCHEDULE);

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

  static async deleteById(id, baseInfo = {}, modifier = '') {
    const col = DefaultDBClient.getCollection(modelCodes.NURSINGSHIFTSCHEDULE);
    const res = await commonDelete.deleteById(col, id, baseInfo.__cc, baseInfo.__sc, modifier);
    return res;
  }
}

module.exports = NursingShiftScheduleRepository;
