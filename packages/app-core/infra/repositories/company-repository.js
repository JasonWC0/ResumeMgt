/**
 * FeaturePath: Common-Repository--機構
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: company-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-02-10 10:33:42 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongoose').Types;
const {
  LOGGER, models, codes, tools,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { CompanyEntity, modelCodes } = require('../../domain');
const commonDelete = require('./common-function/delete');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new CompanyEntity().bindDB(doc).bindObjectId(doc._id.toString());
  return entity;
}

class CompanyRepository {
  /**
   * Create one company doc.
   * @param {CompanyEntity} entity json of company data
   * @returns {Promise.<CompanyEntity>} return CompanyEntity json data
   */
  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.COMPANY);
    const obj = {
      corpId: ObjectId(entity.corpId),
      fullName: entity.fullName,
      shortName: entity.shortName,
      displayName: entity.displayName,
      contractFullName: entity.contractFullName,
      contractShortName: entity.contractShortName,
      serialNumber: entity.serialNumber,
      code: entity.code,
      type: entity.type,
      service: entity.service,
      cityCode: entity.cityCode,
      govtCode: entity.govtCode,
      taxId: entity.taxId,
      licenseNumber: entity.licenseNumber,
      marcom: entity.marcom,
      contract: entity.contract,
      startDate: entity.startDate,
      endDate: entity.endDate,
      registerPlace: entity.registerPlace,
      phone: entity.phone,
      fax: entity.fax,
      bankAccount: entity.bankAccount,
      bankAccount2nd: entity.bankAccount2nd,
      roles: entity.roles,
      region: entity.region,
      organizationalChart: entity.organizationalChart,
      systemSetting: entity.systemSetting,
      institutionSetting: entity.institutionSetting,
      pageAuth: entity.pageAuth,
      reportAuth: entity.reportAuth,
      importERPv3: entity.importERPv3,
      valid: true,
      __cc: entity.__cc,
      __vn: entity.__vn,
      __sc: entity.__sc,
    };
    // TODO: remove
    if (ObjectId.isValid(entity.serviceGroupId)) {
      obj.serviceGroupId = ObjectId(entity.serviceGroupId);
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

  /**
   * Find one company doc. by ObjectId
   * @param {string} id DB ObjectId
   * @returns {Promise.<CompanyEntity>} return CompanyEntity json data
   */
  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.COMPANY);
    if (!ObjectId.isValid(id)) { return undefined; }

    try {
      const res = await col.findById(id).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findByIds(ids, select = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.COMPANY);
    // eslint-disable-next-line consistent-return
    ids.forEach((item, index) => {
      if (!ObjectId.isValid(item)) { return undefined; }
      ids[index] = ObjectId(item);
    });
    const query = {
      _id: { $in: ids },
      valid: true,
    };

    try {
      // TODO: remove populate serviceGroupId
      const resList = tools.CustomValidator.nonEmptyObject(select) ? await col.find(query).populate('serviceGroupId').select(select).lean() : await col.find(query).populate('serviceGroupId').lean();

      resList.forEach((item, index) => {
        resList[index].id = item._id.toString();
      });

      return resList;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findByQBE(qbe = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.COMPANY);
    const query = {
      valid: true,
    };
    for (const key of Object.keys(qbe)) {
      query[key] = qbe[key];
    }

    try {
      const resList = await col.find(query).lean();

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

  static async findAll() {
    const col = DefaultDBClient.getCollection(modelCodes.COMPANY);
    const obj = { valid: true };

    try {
      const resList = await col.find(obj).populate('corpId').lean();

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

  /**
   * Update one company doc. by ObjectId
   * @param {string} id DB ObjectId
   * @param {CompanyEntity} entity json of company data
   * @returns {Promise.<CompanyEntity>} return CompanyEntity json data
   */
  static async updateById(id, entity) {
    const col = DefaultDBClient.getCollection(modelCodes.COMPANY);
    const query = {
      _id: ObjectId(id),
      valid: true,
    };
    const obj = {
      fullName: entity.fullName,
      shortName: entity.shortName,
      displayName: entity.displayName,
      type: entity.type,
      govtCode: entity.govtCode,
      taxId: entity.taxId,
      licenseNumber: entity.licenseNumber,
      contract: entity.contract,
      startDate: entity.startDate,
      endDate: entity.endDate,
      registerPlace: entity.registerPlace,
      phone: entity.phone,
      fax: entity.fax,
      bankAccount: entity.bankAccount,
      bankAccount2nd: entity.bankAccount2nd,
      roles: entity.roles,
      organizationalChart: entity.organizationalChart,
      systemSetting: entity.systemSetting,
      institutionSetting: entity.institutionSetting,
      importERPv3: entity.importERPv3,
      __cc: entity.__cc,
      __sc: entity.__sc,
    };

    try {
      const res = await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } });
      if (!tools.CustomValidator.isEqual(res.nModified, 1)) { return false; }
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async updateFieldsById(id, obj) {
    const col = DefaultDBClient.getCollection(modelCodes.COMPANY);
    const query = {
      _id: ObjectId(id),
      valid: true,
    };

    try {
      const res = await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } });
      if (!tools.CustomValidator.isEqual(res.nModified, 1)) { return false; }
      return obj;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Delete one company doc. by ObjectId (set valid is false)
   * @param {string} id DB ObjectId
   * @returns {boolean} return success or not
   */
  static async deleteById(id, baseInfo = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.COMPANY);
    const res = await commonDelete.deleteById(col, id, baseInfo.__cc, baseInfo.__sc);
    return res;
  }
}

module.exports = CompanyRepository;
