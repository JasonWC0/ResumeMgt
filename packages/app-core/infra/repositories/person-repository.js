/**
 * FeaturePath: Common-Repository--人員資料
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

/* eslint-disable object-curly-newline */
const { ObjectId } = require('mongoose').Types;
const {
  LOGGER,
  models,
  codes,
  tools,
} = require('@erpv3/app-common');
const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const fsExtra = require('fs-extra');
const { PersonEntity, modelCodes } = require('../../domain');
const commonDelete = require('./common-function/delete');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  return new PersonEntity()
    .bind(doc)
    .bindObjectId(doc._id.toString())
    .bindCorpId(doc.corpId.toString());
}

function _customerTransToObjectId(_customer) {
  const { cusRoles, agent, contacts, caregivers } = _customer;
  if (CustomValidator.nonEmptyArray(cusRoles)) {
    cusRoles.forEach((data) => {
      if (ObjectId.isValid(data.companyId)) {
        data.companyId = ObjectId(data.companyId);
      }
    });
  }

  if (agent && ObjectId.isValid(agent.personId)) {
    agent.personId = ObjectId(agent.personId);
  }

  if (CustomValidator.nonEmptyArray(contacts)) {
    contacts.forEach((data) => {
      if (ObjectId.isValid(data.personId)) {
        data.personId = ObjectId(data.personId);
      }
    });
  }

  const { primary, secondary } = caregivers;
  if (primary && ObjectId.isValid(primary.personId)) {
    caregivers.primary.personId = ObjectId(caregivers.primary.personId);
  }
  if (secondary && ObjectId.isValid(secondary.personId)) {
    caregivers.secondary.personId = ObjectId(caregivers.secondary.personId);
  }
}

function _employeeTransToObjectId(_employee) {
  const { comPersonMgmt } = _employee;
  if (CustomValidator.nonEmptyArray(comPersonMgmt)) {
    comPersonMgmt.forEach((data) => {
      if (ObjectId.isValid(data.companyId)) {
        data.companyId = ObjectId(data.companyId);
      }

      if (ObjectId.isValid(data.supervisorId)) {
        data.supervisorId = ObjectId(data.supervisorId);
      }

      if (ObjectId.isValid(data.supervisor2Id)) {
        data.supervisor2Id = ObjectId(data.supervisor2Id);
      }

      if (data.reportingAgent.employeeAgent && ObjectId.isValid(data.reportingAgent.employeeAgent)) {
        data.reportingAgent.employeeAgent = ObjectId(data.reportingAgent.employeeAgent);
      }
    });
  }
}

class PersonRepository {
  /**
   * Create one person doc.
   * @param {PersonEntity} entity json of person data
   * @returns {Promise.<PersonEntity>} return PersonEntity json data
   */
  static async create(entity, session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.PERSON);
    if (entity.customer) {
      _customerTransToObjectId(entity.customer);
    }

    const obj = {
      corpId: ObjectId(entity.corpId),
      name: entity.name,
      hashName: entity.hashName,
      nickname: entity.nickname,
      personalId: entity.personalId,
      email: entity.email,
      mobile: entity.mobile,
      phoneH: entity.phoneH,
      phoneO: entity.phoneO,
      photo: entity.photo,
      genogram: entity.genogram,
      ecomap: entity.ecomap,
      swot: entity.swot,
      extNumber: entity.extNumber,
      lineId: entity.lineId,
      facebook: entity.facebook,
      gender: entity.gender,
      birthDate: entity.birthDate,
      nationality: entity.nationality,
      languages: entity.languages,
      education: entity.education,
      disability: entity.disability,
      aborigines: entity.aborigines,
      aboriginalRace: entity.aboriginalRace,
      belief: entity.belief,
      registerPlace: entity.registerPlace,
      residencePlace: entity.residencePlace,
      employee: entity.employee,
      customer: entity.customer,
      otherLanguage: entity.otherLanguage,
      note: entity.note,
      __sc: entity.__sc,
      __cc: entity.__cc,
    };

    try {
      const res = await col.create([obj], { session });
      entity.bindObjectId(res[0]._id.toString());
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Find one person doc. by person id & corporate id.
   * @param {string} id DB ObjectId
   * @returns {Promise.<PersonEntity>} return PersonEntity json data
   */
  static async findByPersonalIdAndCorpId(personalId = '', corpId = '') {
    const corpCol = DefaultDBClient.getCollection(modelCodes.CORPORATION);
    const oCorp = await corpCol.findById(corpId);
    const col = DefaultDBClient.getCollection(modelCodes.PERSON);
    if (
      !tools.CustomValidator.nonEmptyString(personalId)
      || !tools.CustomValidator.nonEmptyString(corpId)
    ) { return undefined; }
    const keys = await fsExtra.readJson(oCorp.__enc.provider);
    const sk = keys[oCorp.__enc.keyId];
    const encryptPersonalId = await tools.CustomUtils.encryptionWithAESCBCPKCS7(personalId, sk.key, sk.iv);
    try {
      const q = {
        'personalId.cipher': encryptPersonalId,
        corpId: ObjectId(corpId),
        valid: true,
      };
      const res = await col.findOne(q).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Find one person doc. by ObjectId
   * @param {string} id DB ObjectId
   * @returns {Promise.<PersonEntity>} return PersonEntity json data
   */
  static async findById(id = '') {
    if (!ObjectId.isValid(id)) { return undefined; }
    const col = DefaultDBClient.getCollection(modelCodes.PERSON);
    try {
      const res = await col.findOne({ _id: ObjectId(id), valid: true }).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async findByIds(ids = []) {
    const col = DefaultDBClient.getCollection(modelCodes.PERSON);
    const objIds = [];
    ids.forEach((id) => {
      if (ObjectId.isValid(id)) {
        objIds.push(ObjectId(id));
      }
    });
    const query = {
      _id: objIds,
      valid: true,
    };

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

  /**
   * Update one company doc. by ObjectId
   * @param {string} id DB ObjectId
   * @param {PersonEntity} entity json of company data
   * @returns {Promise.<PersonEntity>} return PersonEntity json data
   */
  static async updateById(id = '', entity = new PersonEntity(), session = null) {
    const col = DefaultDBClient.getCollection(modelCodes.PERSON);
    const query = {
      _id: ObjectId(id),
      valid: true,
    };

    if (entity.customer) {
      _customerTransToObjectId(entity.customer);
    }

    if (entity.employee) {
      _employeeTransToObjectId(entity.employee);
    }

    try {
      delete entity.__vn;
      entity = CustomUtils.convertId(entity);
      const res = await col.updateOne(query, { $set: entity, $inc: { __vn: 1 } }, { session });
      if (!tools.CustomValidator.isEqual(res.nModified, 1)) { return false; }
      entity.id = id;
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Delete one company doc. by ObjectId
   * @param {PersonEntity} entity json of company data
   * @returns {Promise.<PersonEntity>} return PersonEntity json data
   */
  static async deletePerson(entity = new PersonEntity()) {
    const col = DefaultDBClient.getCollection(modelCodes.PERSON);
    const res = await commonDelete.deleteById(col, entity.id, entity.__cc, entity.__sc, entity.modifier);
    return res;
  }

  /**
   * Fuzzy search person doc. by name
   * @param {string} corpId corpId
   * @param {string} name name
   * @returns {Promise.<Array<PersonEntity>>} return PersonEntity json data
   */
  static async fuzzySearchByCorpIdAndName(corpId = '', name = '') {
    const col = DefaultDBClient.getCollection(modelCodes.PERSON);
    let hn = '';
    for await (const c of name) {
      hn += await (await tools.CustomUtils.hashedWithSalt(c)).substring(0, 8);
    }
    const query = {
      corpId: ObjectId(corpId),
      hashName: { $regex: hn },
      valid: true,
    };

    try {
      const res = await col.find(query).lean();
      if (!CustomValidator.nonEmptyArray(res)) {
        return [];
      }

      return res.map((r) => _transform(r));
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
 * push customer role to customer info.
 * @param {String} personId person ID
 * @param {Number} cusRole customer role
 * @returns {Promise.<Boolean>} return push result
 */
  static async pushCustomerRole(personId, companyId, cusRole) {
    const query = {
      _id: ObjectId(personId),
      valid: true,
    };
    try {
      const col = DefaultDBClient.getCollection(modelCodes.PERSON);
      const p = await col.countDocuments({ $and: [query, { 'customer.cusRoles': { $elemMatch: { companyId: ObjectId(companyId) } } }] });
      let res;
      if (!p) {
        res = await col.updateOne(query, {
          $push: {
            'customer.cusRoles': {
              companyId,
              roles: [cusRole],
            },
          },
        });
      } else {
        res = await col.updateOne({ $and: [query, { 'customer.cusRoles': { $elemMatch: { companyId } } }] }, {
          $addToSet: { 'customer.cusRoles.$.roles': cusRole },
        });
      }
      return tools.CustomValidator.isEqual(res.modifiedCount, 1);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = PersonRepository;
