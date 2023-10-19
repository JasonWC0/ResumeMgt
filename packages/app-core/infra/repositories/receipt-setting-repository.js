/**
 * FeaturePath: Common-Repository--收據設定
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const {
  LOGGER,
  models,
  codes,
  tools,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { ObjectId } = require('mongoose').Types;
const { ReceiptSettingEntity, modelCodes, coreErrorCodes } = require('../../domain');
const commonDelete = require('./common-function/delete');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  return new ReceiptSettingEntity()
    .bind(doc)
    .bindObjectId(doc._id.toString())
    .bindCompanyId(doc.companyId.toString());
}

class ReceiptSettingRepository {
  /**
   * Create service item.
   * @param {ReceiptSettingEntity} entity Json of service item data
   * @returns {Promise.<ReceiptSettingEntity>} return ReceiptSettingEntity json data
   */
  static async create(entity = new ReceiptSettingEntity()) {
    const col = DefaultDBClient.getCollection(modelCodes.RECEIPTSETTING);
    const obj = {
      companyId: ObjectId(entity.companyId),
      contentType: entity.contentType,
      pos: entity.pos,
      text: entity.text,
      photo: entity.photo,
      url: entity.url,
      note: entity.note,
      modifier: entity.modifier,
      reportType: entity.reportType,
      invalidTime: entity.invalidTime,
      creator: entity.creator,
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

  /**
  * Find all receiptSettings by receipt setting id.
  * @param {companyId} receiptSettingId receipt setting id
  * @returns {Promise.<ReceiptSettingEntity>} return ReceiptSettingEntity json data
  */
  static async findOne(receiptSettingId = '') {
    const col = DefaultDBClient.getCollection(modelCodes.RECEIPTSETTING);
    if (!ObjectId.isValid(receiptSettingId)) { return undefined; }
    const query = {
      _id: ObjectId(receiptSettingId),
      valid: true,
    };
    const oReceiptSetting = await col.findOne(query).lean();
    if (!oReceiptSetting) { return undefined; }
    return _transform(oReceiptSetting);
  }

  /**
   * Find all receiptSettings by companyId.
   * @param {companyId} companyId Company id
   * @returns {Promise.<Array<ReceiptSettingEntity>>} return ReceiptSettingEntitys json data
   */
  static async listByCompanyId(companyId = '', qbe = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.RECEIPTSETTING);
    const query = {
      ...qbe,
      companyId: ObjectId(companyId),
      valid: true,
    };
    const oReceiptSettings = await col.find(query).lean();
    if (!oReceiptSettings) { return []; }
    return oReceiptSettings.map((p) => new ReceiptSettingEntity().bind(p).bindObjectId(p._id.toString()));
  }

  /**
   * Delete receiptSetting by id.
   * @param {ReceiptSettingEntity} ReceiptSettingEntity receiptSetting
   * @returns {Promise.<Array<ReceiptSettingEntity>>} return ReceiptSettingEntity json data
   */
  static async deleteReceiptSetting(receiptSetting, baseInfo = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.RECEIPTSETTING);
    const res = await commonDelete.deleteById(col, receiptSetting.id, baseInfo.__cc, baseInfo.__sc, receiptSetting.modifier);
    return res;
  }

  /**
   * Update receipt setting by id.
   * @param {String} id service item id
   * @param {ReceiptSettingEntity} entity Json of service item data
   * @returns {Promise.<Array<ReceiptSettingEntity>>} return ReceiptSettingEntity json data
   */
  static async updateOne(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.RECEIPTSETTING);
    const oReceiptSetting = await col.findById(entity.id);
    if (!oReceiptSetting) {
      throw new models.CustomError(coreErrorCodes.ERR_SERVICE_ITEM_NOT_FOUND);
    }
    try {
      delete entity.__vn;
      const res = await col.updateOne({ _id: ObjectId(entity.id) }, { $set: entity, $inc: { __vn: 1 } });
      if (!tools.CustomValidator.isEqual(res.nModified, 1)) { return false; }
      return true;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  // /**
  //  * Delete receiptSetting by id.
  //  * @param {Array<String>} receiptSettingId receiptSetting id
  //  * @returns {Promise.<Array<ReceiptSettingEntity>>} return ReceiptSettingEntity json data
  //  */
  // static async deleteReceiptSettings(receiptSettingIds = [], deleter = '', basicInfo = {}) {
  //   const col = DefaultDBClient.getCollection(modelCodes.RECEIPTSETTING);
  //   try {
  //     const objectIds = receiptSettingIds.map((id) => ObjectId(id));
  //     const res = await col.updateMany({
  //       _id: { $in: objectIds },
  //     }, {
  //       $set: {
  //         valid: false,
  //         deleter,
  //         __cc: basicInfo.__cc,
  //         __sc: basicInfo.__sc,
  //       },
  //       $inc: {
  //         __vn: 1,
  //       },
  //     }).lean();

  //     return res.nModified;
  //   } catch (ex) {
  //     LOGGER.error(ex.stack);
  //     throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
  //   }
  // }
}

module.exports = ReceiptSettingRepository;
