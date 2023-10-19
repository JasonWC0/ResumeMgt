/**
 * FeaturePath: Common-Repository--客製藥品資料
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-medicine-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-09 04:55:08 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongoose').Types;
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { CustomMedicineEntity, modelCodes, customMedicineCategoryCodes } = require('../../domain');
const commonDelete = require('./common-function/delete');

const CUSTOM_DEFAULT_DRUG_CODE = 'C_00000000';

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new CustomMedicineEntity().bindDBObjectId(doc).bindObjectId(doc._id.toString());
  return entity;
}

function _prepareQuery(qbe) {
  const query = {};
  if (CustomValidator.nonEmptyString(qbe.companyId)) {
    if (!ObjectId.isValid(qbe.companyId)) { return undefined; }
    query.companyId = ObjectId(qbe.companyId);
  }

  if (Object.values(customMedicineCategoryCodes).includes(qbe.category)) { query.category = qbe.category; }
  if (CustomValidator.nonEmptyString(qbe.drugCode)) { query.drugCode = { $regex: new RegExp(qbe.drugCode, 'i') }; }
  if (CustomValidator.nonEmptyString(qbe.atcCode)) { query.atcCode = { $regex: new RegExp(qbe.atcCode, 'i') }; }
  if (CustomValidator.nonEmptyString(qbe.chineseName)) { query.chineseName = { $regex: new RegExp(qbe.chineseName, 'i') }; }
  if (CustomValidator.nonEmptyString(qbe.englishName)) { query.englishName = { $regex: new RegExp(qbe.englishName, 'i') }; }

  query.valid = true;
  return query;
}

class CustomMedicineRepository {
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.CUSTOMMEDICINE);
    if (!ObjectId.isValid(entity.companyId)) { return undefined; }

    const obj = {
      companyId: ObjectId(entity.companyId),
      category: entity.category,
      sharedMedicineId: entity.sharedMedicineId,
      drugCode: entity.drugCode,
      atcCode: entity.atcCode,
      licenseCode: entity.licenseCode,
      chineseName: entity.chineseName,
      englishName: entity.englishName,
      genericName: entity.genericName,
      indications: entity.indications,
      sideEffects: entity.sideEffects,
      form: entity.form,
      doses: entity.doses,
      doseUnit: entity.doseUnit,
      storageConditions: entity.storageConditions,
      healthEducation: entity.healthEducation,
      usageInfo: entity.usageInfo,
      remark: entity.remark,
      images: entity.images,
      isAvailable: true,
      __cc: entity.__cc,
      __sc: entity.__sc,
      __vn: 0,
    };
    if (ObjectId.isValid(entity.creator)) {
      obj.creator = ObjectId(entity.creator);
    }
    if (ObjectId.isValid(entity.modifier)) {
      obj.modifier = ObjectId(entity.modifier);
    }

    try {
      const res = await col.create(obj);
      entity.bindObjectId(res._id.toString());
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.CUSTOMMEDICINE);
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

  static async findByIds(ids) {
    const col = DefaultDBClient.getCollection(modelCodes.CUSTOMMEDICINE);
    const _ids = [];
    ids.forEach((id) => {
      if (ObjectId.isValid(id)) {
        _ids.push(ObjectId(id));
      }
    });

    const query = {
      _id: { $in: _ids },
      valid: true,
    };

    try {
      const resList = await col.find(query).lean();

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

  static async findOneByDrugOrAtcCode(_companyId, drugCode = '', atcCode = '') {
    const col = DefaultDBClient.getCollection(modelCodes.CUSTOMMEDICINE);
    const query = {
      companyId: ObjectId(_companyId),
    };
    if (CustomValidator.nonEmptyString(drugCode)) { query.drugCode = drugCode; }
    if (CustomValidator.nonEmptyString(atcCode)) { query.atcCode = atcCode; }
    query.valid = true;

    try {
      const res = await col.findOne(query).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findByQBE(qbe) {
    const col = DefaultDBClient.getCollection(modelCodes.CUSTOMMEDICINE);
    const query = _prepareQuery(qbe);

    try {
      const resList = await col.find(query).sort(qbe.order)
        .skip(Number.parseInt(qbe.skip, 10))
        .limit(Number.parseInt(qbe.limit, 10))
        .collation({ locale: 'en', caseLevel: true })
        .lean();
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

  static async countByQBE(qbe) {
    const col = DefaultDBClient.getCollection(modelCodes.CUSTOMMEDICINE);
    const query = _prepareQuery(qbe);

    try {
      const count = await col.countDocuments(query);
      return count;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async updateById(id, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.CUSTOMMEDICINE);
    if (!ObjectId.isValid(id)) { return undefined; }
    const query = {
      _id: ObjectId(id),
      valid: true,
    };
    const obj = {
      indications: entity.indications,
      sideEffects: entity.sideEffects,
      healthEducation: entity.healthEducation,
      storageConditions: entity.storageConditions,
      usageInfo: entity.usageInfo,
      remark: entity.remark,
      images: entity.images,
      isAvailable: entity.isAvailable,
      __cc: entity.__cc,
      __sc: entity.__sc,
    };
    if (ObjectId.isValid(entity.modifier)) {
      obj.modifier = ObjectId(entity.modifier);
    }

    try {
      const res = await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } });
      return !(!CustomValidator.isEqual(res.nModified, 1));
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async delete(id, baseInfo = {}, modifier = '') {
    const col = DefaultDBClient.getCollection(modelCodes.CUSTOMMEDICINE);
    const res = await commonDelete.deleteById(col, id, baseInfo.__cc, baseInfo.__sc, modifier);
    return res;
  }

  static async generateDrugCode(_companyId) {
    const col = DefaultDBClient.getCollection(modelCodes.CUSTOMMEDICINE);

    const query = {
      companyId: ObjectId(_companyId),
      category: customMedicineCategoryCodes.custom,
      valid: true,
    };

    try {
      const res = await col.findOne(query).sort({ drugCode: -1 }).lean();
      let value = CUSTOM_DEFAULT_DRUG_CODE;
      if (res && res.drugCode.substr(0, 2) === 'C_') {
        const parseNum = parseInt(res.drugCode.substr(2), 10);
        const nextNum = Number.isNaN(parseNum) ? 0 : (parseNum + 1);
        const codeNum = `${nextNum}`.padStart(8, '0');
        value = `C_${codeNum}`;
      }
      return value;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = CustomMedicineRepository;
