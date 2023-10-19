/**
 * FeaturePath: Common-Repository--照顧計畫
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: care-plan-repository.js
 * Project: @erpv3/app-core
 * File Created: 2022-06-06 06:10:40 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { ObjectId } = require('mongoose').Types;
const {
  LOGGER, models, codes, tools,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { CarePlanEntity, modelCodes } = require('../../domain');
const commonDelete = require('./common-function/delete');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new CarePlanEntity().bindDBObjectId(doc).bindObjectId(doc._id.toString());
  return entity;
}

class CarePlanRepository {
  static async create(entity, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.CAREPLAN);
    if (!ObjectId.isValid(entity.caseId)) { return undefined; }
    let serviceItems;
    if (tools.CustomValidator.nonEmptyArray(entity.serviceItems)) {
      serviceItems = entity.serviceItems.filter((value) => ObjectId.isValid(value.itemId));
      serviceItems.forEach((value, index) => { serviceItems[index].itemId = ObjectId(value.itemId); });
      serviceItems.sort((a, b) => ((a.serviceCode < b.serviceCode) ? 1 : -1));
    }
    if (tools.CustomValidator.nonEmptyArray(entity.isOPTDecisionRefCase)) {
      entity.isOPTDecisionRefCase.forEach((value, index) => {
        entity.isOPTDecisionRefCase[index] = ObjectId(value);
      });
    }

    const obj = {
      caseId: ObjectId(entity.caseId),
      version: entity.version,
      isHtml: entity.isHtml,
      planType: entity.planType,
      consultingDate: entity.consultingDate,
      acceptConsultingDate: entity.acceptConsultingDate,
      visitingDate: entity.visitingDate,
      firstServiceDate: entity.firstServiceDate,
      reliefType: entity.reliefType,
      cmsLevel: entity.cmsLevel,
      disabilityCategoryType: entity.disabilityCategoryType,
      newDisabilityCategories: entity.newDisabilityCategories,
      oldDisabilityCategories: entity.oldDisabilityCategories,
      oldDisabilityCategoriesList: entity.oldDisabilityCategoriesList,
      disabilityCategories: entity.disabilityCategories,
      disabilityCertification: entity.disabilityCertification,
      icd: entity.icd,
      icdOthers: entity.icdOthers,
      disability: entity.disability,
      disabilityItem: entity.disabilityItem,
      isIntellectualDisability: entity.isIntellectualDisability,
      isAA11a: entity.isAA11a,
      isAA11b: entity.isAA11b,
      isAA11aRemind: entity.isAA11aRemind,
      pricingType: entity.pricingType,
      foreignCareSPAllowance: entity.foreignCareSPAllowance,
      planStartDate: entity.planStartDate,
      introduction: entity.introduction,
      subjectChangeSummary: entity.subjectChangeSummary,
      changeReason: entity.changeReason,
      declaredServiceCategory: entity.declaredServiceCategory,
      serviceCategoryOfACM: entity.serviceCategoryOfACM,
      disease: entity.disease,
      hasDiseaseHistory: entity.hasDiseaseHistory,
      diseaseHistoryStr: entity.diseaseHistoryStr,
      diseaseHistoryList: entity.diseaseHistoryList,
      behaviorAndEmotion: entity.behaviorAndEmotion,
      note: entity.note,
      bcPayment: entity.bcPayment,
      gPayment: entity.gPayment,
      AA05EntitledDeclared: entity.AA05EntitledDeclared,
      AA06EntitledDeclared: entity.AA06EntitledDeclared,
      AA07EntitledDeclared: entity.AA07EntitledDeclared,
      AA08Declared: entity.AA08Declared,
      AA09Declared: entity.AA09Declared,
      useBA12: entity.useBA12,
      serviceItems,
      otherServiceItems: entity.otherServiceItems,
      introductionOfAOrg: entity.introductionOfAOrg,
      executionOfAOrg: entity.executionOfAOrg,
      noteOfAOrg: entity.noteOfAOrg,
      serviceItemOfAOrg: entity.serviceItemOfAOrg,
      isOPTDecisionRefCase: entity.isOPTDecisionRefCase,
      caseManagerInfo: entity.caseManagerInfo,
      signOffSupervisor: entity.signOffSupervisor,
      __cc: entity.__cc,
      __sc: entity.__sc,
    };
    if (tools.CustomValidator.nonEmptyArray(entity.OPTDecisionRefIds)) {
      entity.OPTDecisionRefIds.forEach((value, index) => {
        entity.OPTDecisionRefIds[index] = ObjectId(value);
      });
      obj.OPTDecisionRefIds = entity.OPTDecisionRefIds;
    }
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

  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.CAREPLAN);
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

  static async findOne(qbe) {
    const col = DefaultDBClient.getCollection(modelCodes.CAREPLAN);
    const query = {};
    if (qbe.caseId) {
      query.caseId = ObjectId(qbe.caseId);
      delete qbe.caseId;
    }
    query.valid = true;
    Object.keys(qbe).forEach((key) => { query[key] = qbe[key]; });

    try {
      const res = await col.findOne(query).populate('serviceItems.itemId').lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findList(qbe) {
    const col = DefaultDBClient.getCollection(modelCodes.CAREPLAN);
    const query = {};
    if (qbe.caseId) {
      query.caseId = ObjectId(qbe.caseId);
      delete qbe.caseId;
    }
    query.valid = true;
    Object.keys(qbe).forEach((key) => { query[key] = qbe[key]; });

    try {
      const resList = await col.find(query).populate('serviceItems.itemId').sort({ planStartDate: -1 }).lean();

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

  static async updateById(id, obj, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.CAREPLAN);
    const query = {
      _id: ObjectId(id),
      valid: true,
    };
    if (tools.CustomValidator.nonEmptyArray(obj.serviceItems)) {
      obj.serviceItems.forEach((value, index) => {
        obj.serviceItems[index].itemId = ObjectId(value.itemId);
      });
    }
    if (CustomValidator.nonEmptyString(obj.modifier)) {
      obj.modifier = ObjectId(obj.modifier);
    }

    try {
      delete obj.__vn;
      await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } }, { session });
      return true;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async updateByQbe(qbe = {}, obj, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.CAREPLAN);

    const query = {};
    if (Object.keys(qbe).includes('caseId') && ObjectId.isValid(qbe.caseId)) {
      query.caseId = ObjectId(qbe.caseId);
    }
    query.valid = true;
    for (const key of Object.keys(qbe)) {
      if (key === 'caseId') { continue; }
      query[key] = qbe[key];
    }

    try {
      delete obj.__vn;
      await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } }, { session });
      return true;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async deleteById(id, baseInfo = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.CAREPLAN);
    const res = await commonDelete.deleteById(col, id, baseInfo.__cc, baseInfo.__sc);
    return res;
  }

  static async deleteByQbe(qbe, baseInfo = {}, modifier = '', session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.CAREPLAN);

    const query = {};
    if (Object.keys(qbe).includes('caseId') && ObjectId.isValid(qbe.caseId)) {
      query.caseId = ObjectId(qbe.caseId);
    }
    query.valid = true;
    for (const key of Object.keys(qbe)) {
      if (key === 'caseId') { continue; }
      query[key] = qbe[key];
    }

    const obj = {
      valid: false,
      __cc: baseInfo.__cc,
      __sc: baseInfo.__sc,
    };
    if (CustomValidator.nonEmptyString(modifier)) {
      obj.modifier = ObjectId(modifier);
    }

    try {
      await col.updateMany(query, { $set: obj, $inc: { __vn: 1 } }, { session });
      return true;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findNewestByPersonId(personId = '') {
    const col = DefaultDBClient.getCollection(modelCodes.CASE);
    try {
      const aggregate = col.aggregate();
      const res = await aggregate
        .match({ personId: ObjectId(personId) })
        .lookup({
          from: `${modelCodes.CAREPLAN}s`,
          localField: '_id',
          foreignField: 'caseId',
          as: 'carePlan',
        })
        .unwind({ path: '$carePlan', preserveNullAndEmptyArrays: true })
        .sort({ 'carePlan.updatedAt': -1 })
        .limit(1);
      return (CustomValidator.nonEmptyArray(res)) ? res[0].carePlan : undefined;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = CarePlanRepository;
