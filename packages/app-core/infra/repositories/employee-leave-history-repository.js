/**
 * FeaturePath: Common-Repository--員工請假紀錄
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { ObjectId } = require('mongoose').Types;
const {
  LOGGER,
  models,
  codes,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { EmployeeLeaveHistoryEntity, modelCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  return new EmployeeLeaveHistoryEntity()
    .bind(doc)
    .bindObjectId(doc._id.toString());
}

function _parseQbe(qbe = {}) {
  const {
    companyId,
    personId,
    startDate,
    endDate,
    status,
    leaveType,
  } = qbe;
  const query = {
    companyId: ObjectId(companyId),
    valid: true,
  };
  if (personId) query.personId = ObjectId(personId);
  if (CustomValidator.isNumber(status)) query.status = status;
  if (startDate) query.endDate = { $gte: startDate };
  if (endDate) query.startDate = { $lte: endDate };
  if (leaveType || CustomValidator.isNumber(leaveType)) query.leaveType = leaveType;
  return query;
}

class EmployeeLeaveHistoryRepository {
  static async findList(qbe = {}) {
    const {
      skip,
      limit,
      order,
    } = qbe;
    const query = _parseQbe(qbe);
    const col = DefaultDBClient.getCollection(modelCodes.EMPLOYEELEAVEHISTORY);
    try {
      const sortStr = order ? order.replace(',', ' ') : '';
      const res = await col
        .find(query)
        .skip(skip || 0)
        .limit(limit || 50)
        .sort(sortStr)
        .lean();
      return res.map((d) => _transform(d));
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async countList(qbe = {}) {
    const query = _parseQbe(qbe);
    const col = DefaultDBClient.getCollection(modelCodes.EMPLOYEELEAVEHISTORY);
    try {
      return col.countDocuments(query);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  /**
   * Find one employee leave record doc. by ObjectId
   * @param {string} id DB ObjectId
   * @returns {Promise.<EmployeeLeaveHistoryEntity>} return EmployeeLeaveHistoryEntity json data
   */
  static async findById(id) {
    const col = DefaultDBClient.getCollection(modelCodes.EMPLOYEELEAVEHISTORY);
    if (!ObjectId.isValid(id)) { return undefined; }

    try {
      const res = await col.findById(id).lean();
      return _transform(res);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async create(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.EMPLOYEELEAVEHISTORY);
    const obj = {
      companyId: ObjectId(entity.companyId),
      personId: ObjectId(entity.personId),
      startDate: entity.startDate,
      endDate: entity.endDate,
      leaveType: entity.leaveType,
      memo: entity.memo,
      leaveAgent: entity.leaveAgent,
      salarySystem: entity.salarySystem,
      cancelTime: null,
      leaveDetail: entity.leaveDetail,
      status: entity.status,
      totalHours: entity.totalHours,
      valid: true,
      creator: entity.creator,
      __cc: entity.__cc,
      __vn: 0,
      __sc: entity.__sc,
    };

    if (ObjectId.isValid(entity.leaveAgent.mainId)) obj.leaveAgent.mainId = ObjectId(entity.leaveAgent.mainId);
    if (ObjectId.isValid(entity.leaveAgent.careAttendantId)) obj.leaveAgent.careAttendantId = ObjectId(entity.leaveAgent.careAttendantId);
    if (ObjectId.isValid(entity.leaveAgent.careGiverId)) obj.leaveAgent.careGiverId = ObjectId(entity.leaveAgent.careGiverId);
    if (ObjectId.isValid(entity.leaveAgent.driverId)) obj.leaveAgent.driverId = ObjectId(entity.leaveAgent.driverId);

    try {
      const res = await col.create(obj);
      entity.bindObjectId(res._id.toString());
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }

  static async update(entity) {
    const col = DefaultDBClient.getCollection(modelCodes.EMPLOYEELEAVEHISTORY);
    const obj = {
      leaveType: entity.leaveType,
      memo: entity.memo,
      status: entity.status,
      cancelTime: entity.cancelTime,
      modifier: entity.modifier,
      __cc: entity.__cc,
      __sc: entity.__sc,
    };
    if (CustomValidator.isBoolean(entity.valid)) {
      obj.valid = entity.valid;
    }

    try {
      const res = await col.updateOne({ _id: ObjectId(entity.id) }, { $set: obj, $inc: { __vn: 1 } });
      if (res.n !== 1 && res.nModified !== 1) {
        throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
      }
      return entity;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = EmployeeLeaveHistoryRepository;
