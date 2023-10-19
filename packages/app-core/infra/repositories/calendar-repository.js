/**
 * FeaturePath: Common-Repository--假日行事曆
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: calendar-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-19 11:49:20 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const moment = require('moment');
const { ObjectId } = require('mongoose').Types;
const {
  LOGGER, models, codes, tools,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { CalendarEntity, modelCodes } = require('../../domain');
const commonDelete = require('./common-function/delete');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new CalendarEntity().bindDBObjectId(doc).bindObjectId(doc._id.toString());
  return entity;
}

class CalendarRepository {
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.CALENDAR);
    if (!ObjectId.isValid(entity.companyId)) { return undefined; }

    const obj = {
      companyId: ObjectId(entity.companyId),
      type: entity.type,
      date: entity.date,
      time: entity.time,
      note: entity.note,
      creator: ObjectId(entity.creator),
      modifier: ObjectId(entity.modifier),
      __cc: entity.__cc,
      __vn: entity.__vn,
      __sc: entity.__sc,
      valid: true,
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

  static async find(qbe = {}, specificCompanyId = true) {
    const col = DefaultDBClient.getCollection(modelCodes.CALENDAR);
    const query = {
      valid: true,
    };
    if (tools.CustomValidator.nonEmptyString(qbe.companyId) && ObjectId.isValid(qbe.companyId)) {
      if (specificCompanyId) {
        query.companyId = ObjectId(qbe.companyId);
      } else {
        query.$or = [
          { companyId: { $exists: false } },
          { companyId: { $in: [ObjectId(qbe.companyId), null] } }
        ];
      }
    }
    if (tools.CustomValidator.isNumber(qbe.year) && tools.CustomValidator.isNumber(qbe.month)) {
      const _date = moment().set('year', qbe.year).set('month', qbe.month);
      query.date = {
        $gte: _date.startOf('m').toDate(),
        $lt: _date.endOf('m').toDate(),
      };
    } else if (tools.CustomValidator.isNumber(qbe.year)) {
      const _date = moment().set('year', qbe.year);
      query.date = {
        $gte: _date.startOf('y').toDate(),
        $lt: _date.endOf('y').toDate(),
      };
    }
    if (tools.CustomValidator.nonEmptyString(qbe.date)) {
      query.date = qbe.date;
    }
    if (tools.CustomValidator.nonEmptyArray(qbe.type)) {
      query.type = { $in: qbe.type };
    }
    if (tools.CustomValidator.nonEmptyString(qbe.region)) {
      query.region = { $in: [qbe.region, null, ''] };
    }

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

  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.CALENDAR);
    if (!ObjectId.isValid(id)) { return undefined; }
    const query = { _id: ObjectId(id), valid: true };
    try {
      const res = await col.findOne(query).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async updateById(id, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.CALENDAR);
    if (!ObjectId.isValid(id)) { return undefined; }

    const query = { _id: ObjectId(id) };
    const obj = {
      type: entity.type,
      date: entity.date,
      time: entity.time,
      note: entity.note,
      modifier: ObjectId(entity.modifier),
      __cc: entity.__cc,
      __sc: entity.__sc,
    };
    try {
      const res = await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } });
      return !(!tools.CustomValidator.isEqual(res.nModified, 1));
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async deleteById(id, _obj) {
    const col = DefaultDBClient.getCollection(modelCodes.CALENDAR);
    const res = await commonDelete.deleteById(col, id, _obj.__cc, _obj.__sc, _obj.modifier);
    return res;
  }
}

module.exports = CalendarRepository;
