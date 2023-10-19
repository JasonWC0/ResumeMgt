/**
 * FeaturePath: Common-Repository--服務項目
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const {
  LOGGER,
  models,
  codes,
  tools,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { ObjectId } = require('mongoose').Types;
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { ServiceItemEntity, modelCodes, coreErrorCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  return new ServiceItemEntity()
    .bind(doc)
    .bindObjectId(doc._id.toString());
}

class ServiceItemRepository {
  /**
   * Create service item.
   * @param {ServiceItemEntity} entity Json of service item data
   * @returns {Promise.<ServiceItemEntity>} return ServiceItemEntity json data
   */
  static async create(entity = new ServiceItemEntity()) {
    const col = DefaultDBClient.getCollection(modelCodes.SERVICEITEM);
    if (CustomValidator.nonEmptyString(entity.departFrom)) {
      entity.departFrom = ObjectId(entity.departFrom);
    }
    entity.valid = true;
    try {
      const res = await col.create(entity);
      entity.bindObjectId(res._id.toString());
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Find the newest RA serial number.
   * @param {companyId} companyId Company id
   * @returns {Promise.<ServiceItemEntity>} return ServiceItemEntity json data
   */
  static async findNewestRAServiceByCompanyId(companyId = '') {
    const col = DefaultDBClient.getCollection(modelCodes.SERVICEITEM);
    try {
      const res = await col
        .findOne({ companyId, serviceCode: { $regex: 'RA' } })
        .sort('-createdAt')
        .lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Find one serviceItem by serviceItemId.
   * @param {serviceItemId} serviceItemId service item id
   * @returns {Promise.<ServiceItemEntity>} return ServiceItemEntitys json data
   */
  static async findOne(id = '') {
    if (!CustomValidator.nonEmptyString(id) || !ObjectId.isValid(id)) { return undefined; }
    const col = DefaultDBClient.getCollection(modelCodes.SERVICEITEM);
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

  /**
   * Find one serviceItem by companyId and service name.
   * @param {String} companyId company id
   * @param {String} serviceName service name
   * @returns {Promise.<ServiceItemEntity>} return ServiceItemEntity json data
   */
  static async findOneByCompanyIdAndServiceName(companyId, serviceName) {
    const col = DefaultDBClient.getCollection(modelCodes.SERVICEITEM);
    const query = {
      companyId: ObjectId(companyId),
      serviceName,
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

  /**
   * Find all serviceItems by companyId.
   * @param {companyId} companyId Company id
   * @returns {Promise.<Array<ServiceItemEntity>>} return ServiceItemEntitys json data
   */
  static async listByCompanyId(companyId = '') {
    const col = DefaultDBClient.getCollection(modelCodes.SERVICEITEM);
    const query = {
      companyId: ObjectId(companyId),
      valid: true,
    };
    const oServiceItems = await col.find(query).lean();
    if (!oServiceItems) { return []; }
    return oServiceItems.map((p) => new ServiceItemEntity().bind(p).bindObjectId(p._id.toString()));
  }

  /**
   * find serviceItems by qbe
   * @param {object} qbe
   * @returns {Promise.<Array<ServiceItemEntity>>} return ServiceItemEntitys json data
   */
  static async findList(qbe) {
    const col = DefaultDBClient.getCollection(modelCodes.SERVICEITEM);
    const query = {};
    if (qbe.companyId) {
      query.companyId = ObjectId(qbe.companyId);
      delete qbe.companyId;
    }
    Object.keys(qbe).forEach((key) => { query[key] = qbe[key]; });

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

  /**
   * Delete serviceItem by id.
   * @param {companyId} companyId serviceItem id
   * @returns {Promise.<Array<ServiceItemEntity>>} return ServiceItemEntity json data
   */
  static async deleteServiceItem(serviceItemId = '', deleter = '', basicInfo = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.SERVICEITEM);
    const obj = {
      valid: false,
      deleter,
      __cc: basicInfo.__cc,
      __sc: basicInfo.__sc,
    };

    try {
      const res = await col.updateOne({ _id: ObjectId(serviceItemId) }, { $set: obj, $inc: { __vn: 1 } });
      if (!tools.CustomValidator.isEqual(res.nModified, 1)) { return false; }
      return true;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Update serviceItem by id.
   * @param {String} id service item id
   * @param {ServiceItemEntity} entity Json of service item data
   * @returns {Promise.<Array<ServiceItemEntity>>} return ServiceItemEntity json data
   */
  static async updateServiceItem(id = '', entity = new ServiceItemEntity()) {
    const col = DefaultDBClient.getCollection(modelCodes.SERVICEITEM);
    const oServiceItem = await col.findById(id);
    if (!oServiceItem) {
      throw new models.CustomError(coreErrorCodes.ERR_SERVICE_ITEM_NOT_FOUND);
    }
    try {
      delete entity.__vn;
      const res = await col.updateOne({ _id: ObjectId(id) }, { $set: entity, $inc: { __vn: 1 } });
      if (!tools.CustomValidator.isEqual(res.nModified, 1)) { return false; }
      return true;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Delete serviceItem by id.
   * @param {Array<String>} serviceItemId serviceItem id
   * @returns {Promise.<Array<ServiceItemEntity>>} return ServiceItemEntity json data
   */
  static async deleteServiceItems(serviceItemIds = [], deleter = '', basicInfo = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.SERVICEITEM);
    try {
      const objectIds = serviceItemIds.map((id) => ObjectId(id));
      const res = await col.updateMany({
        _id: { $in: objectIds },
      }, {
        $set: {
          valid: false,
          deleter,
          __cc: basicInfo.__cc,
          __sc: basicInfo.__sc,
        },
        $inc: {
          __vn: 1,
        },
      }).lean();

      return res.nModified;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Delete serviceItem by id.
   * @param {Array<String>} serviceItemIds serviceItem ids
   * @returns {Promise.<Array<ObjetcId>>} return ServiceItemIds
   */
  static async findByIds(serviceItemIds = [], select = {}) {
    const col = DefaultDBClient.getCollection(modelCodes.SERVICEITEM);
    const ObjectIds = [];
    serviceItemIds.forEach((id) => {
      if (ObjectId.isValid(id)) { ObjectIds.push(ObjectId(id)); }
    });
    const query = { _id: { $in: ObjectIds }, valid: true };
    try {
      const resList = tools.CustomValidator.nonEmptyObject(select) ? await col.find(query).select(select).lean() : await col.find(query).lean();
      resList.forEach((item, index) => {
        resList[index].id = item._id.toString();
      });

      return resList;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = ServiceItemRepository;
