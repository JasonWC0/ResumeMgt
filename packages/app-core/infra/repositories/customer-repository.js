/**
 * FeaturePath: Common-Repository--顧客
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
  tools,
  models,
  codes,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const {
  PersonEntity,
  CustomerEntity,
  modelCodes,
  CustomerObject,
} = require('../../domain');

function _transform(doc) {
  if (!doc || !doc.customer) {
    return undefined;
  }
  return new CustomerEntity()
    .bind(doc.customer)
    .bindCaregivers(doc.customer.caregivers)
    .bindContacts(doc.customer.contacts)
    .bindFoodFile(doc.customer.foodFile);
}

class CustomerRepository {
  /**
   * List employee docs. by company ObjectId
   * @param {PersonEntity} entity json of company data
   * @returns {Promise.<Array<Object>>} return EmployeeEntity json data
   */
  static async listByQbe(qbe = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.PERSON);
    const query = {
      customer: {
        $ne: new CustomerObject().responseInfo(),
      },
      valid: true,
    };
    query['customer.cusRoles'] = { $ne: [] };

    if (tools.CustomValidator.nonEmptyString(qbe.corpId)) {
      query.corpId = ObjectId(qbe.corpId);
    }
    if (tools.CustomValidator.nonEmptyString(qbe.name)) {
      query.name = qbe.name;
    }
    if (tools.CustomValidator.nonEmptyString(qbe.role)) {
      query.role = qbe.role;
    }
    const oPersons = await col.find(query).lean();
    if (!oPersons) { return []; }
    return oPersons.map((p) => new PersonEntity().bind(p).bindObjectId(p._id.toString()));
  }

  /**
   * Find one customer info.
   * @param {String} personId person ID
   * @returns {Promise.<CustomerEntity>} return CustomerEntity json data
   */
  static async findByPersonId(personId = '') {
    const col = DefaultDBClient.getCollection(modelCodes.PERSON);
    try {
      const res = await col.findOne({
        _id: ObjectId(personId),
        valid: true,
      }).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Create customer info.
   * @param {String} personId person ID
   * @param {CustomerEntity} entity json of customer data
   * @returns {Promise.<CustomerEntity>} return CustomerEntity json data
   */
  static async save(personId = '', customer = new CustomerEntity()) {
    const col = DefaultDBClient.getCollection(modelCodes.PERSON);
    const query = {
      _id: ObjectId(personId),
      valid: true,
    };
    const upd = {
      customer: {
        cusRoles: customer.cusRoles,
        contacts: customer.contacts,
        agent: customer.agent,
        caregivers: customer.caregivers,
        foodFile: customer.foodFile,
        foreignCare: customer.foreignCare,
      },
    };
    try {
      const res = await col.updateOne(query, { $set: upd });
      if (!tools.CustomValidator.isEqual(res.nModified, 1)) { return false; }
      return customer;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = CustomerRepository;
