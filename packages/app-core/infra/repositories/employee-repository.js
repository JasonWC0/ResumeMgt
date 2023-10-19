/**
 * FeaturePath: Common-Repository--員工
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { ObjectId } = require('mongoose').Types;
const {
  LOGGER,
  models,
  codes,
  tools,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { PersonEntity, EmployeeEntity, modelCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  return new EmployeeEntity().bind(doc);
}

function _convertComPersonMgmt(entity, baseInfo) {
  const { __cc, __sc } = baseInfo;
  const cpm = entity.comPersonMgmt.map((c) => ({
    companyId: c.companyId ? ObjectId(c.companyId) : null,
    employeeNum: c.employeeNum,
    supervisorId: c.supervisorId ? ObjectId(c.supervisorId) : null,
    supervisor2Id: c.supervisor2Id ? ObjectId(c.supervisor2Id) : null,
    roles: c.roles,
    employmentType: c.employmentType,
    employeeCategory: c.employeeCategory,
    centralGovSystemAccount: c.centralGovSystemAccount,
    weekHours: c.weekHours,
    reportingAgent: {
      isAgent: c.reportingAgent.isAgent,
      agentType: c.reportingAgent.agentType,
      employeeAgent: c.reportingAgent.employeeAgent ? ObjectId(c.reportingAgent.employeeAgent) : null,
    },
    serviceRegion: c.serviceRegion,
    interviewNote: c.interviewNote,
    salarySystem: c.salarySystem,
    startDate: c.startDate,
    endDate: c.endDate,
  }));
  return {
    employee: {
      centralGovSystemAccount: entity.centralGovSystemAccount,
      comPersonMgmt: cpm,
      contact: entity.contact,
      serviceItemQualification: entity.serviceItemQualification,
    },
    __cc,
    __sc,
    modifier: entity.modifier,
    creator: entity.creator,
  };
}

class EmployeeRepository {
  /**
   * Create one person doc.
   * @param {EmployeeEntity} entity json of person data
   * @returns {Promise.<EmployeeEntity>} return EmployeeEntity json data
   */
  static async create(entity = new EmployeeEntity(), baseInfo = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.PERSON);
    const obj = _convertComPersonMgmt(entity, baseInfo);
    try {
      await col.updateOne({ _id: ObjectId(entity.personId) }, { $set: obj, $inc: { __vn: 1 } });
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Find one company doc. by ObjectId
   * @param {string} personId DB person ObjectId
   * @param {string} companyId DB company ObjectId
   * @returns {Promise.<CompanyEntity>} return CompanyEntity json data
   */
  static async findByPersonId(personId = '') {
    const col = DefaultDBClient.getCollection(modelCodes.PERSON);
    if (!ObjectId.isValid(personId)) { return undefined; }

    try {
      const res = await col.findById(personId, { _id: 0, employee: 1 }).lean();
      if (!res) { return undefined; }
      return _transform(res.employee);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Update one company doc. by ObjectId
   * @param {string} id DB ObjectId
   * @param {EmployeeEntity} entity json of company data
   * @returns {Promise.<EmployeeEntity>} return EmployeeEntity json data
   */
  static async updateByPersonId(personId = '', entity = new EmployeeEntity(), baseInfo = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.PERSON);
    const query = {
      _id: ObjectId(personId),
      valid: true,
    };
    const obj = _convertComPersonMgmt(entity, baseInfo);

    try {
      delete entity.__vn;
      const res = await col.updateOne(query, { $set: obj, $inc: { __vn: 1 } });
      if (!tools.CustomValidator.isEqual(res.nModified, 1)) { return false; }
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * List employee docs. by company ObjectId
   * @param {EmployeeEntity} entity json of company data
   * @returns {Promise.<Array<Object>>} return EmployeeEntity json data
   */
  static async listByCompanyId(companyId = '', roles = []) {
    const col = DefaultDBClient.getCollection(modelCodes.PERSON);
    const query = {
      'employee.comPersonMgmt': {
        $elemMatch: { companyId },
      },
      valid: true,
    };
    if (roles.length > 0) {
      query['employee.comPersonMgmt'].$elemMatch.roles = { $in: roles };
    }

    let oPersons = await col.find(query).lean();
    if (!oPersons) { return []; }
    oPersons = oPersons.map((p) => new PersonEntity().bind(p).bindObjectId(p._id.toString()));
    return oPersons;
  }

  /**
   * List employee docs. by company ObjectId and salary system
   * @param {EmployeeEntity} entity json of company data
   * @returns {Promise.<Array<Object>>} return EmployeeEntity json data
   */
  static async listByCompanyIdAndSalarySystem(companyId, salarySystem) {
    const col = DefaultDBClient.getCollection(modelCodes.PERSON);
    const query = {
      'employee.comPersonMgmt': {
        $elemMatch: {
          companyId,
          salarySystem,
        },
      },
      valid: true,
    };
    let oPersons = await col.find(query).lean();
    if (!oPersons) { return []; }
    oPersons = oPersons.map((p) => new PersonEntity().bind(p).bindObjectId(p._id.toString()));
    return oPersons;
  }
}

module.exports = EmployeeRepository;
