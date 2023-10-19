/**
 * FeaturePath: Common-Repository--機構假別
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const {
  LOGGER,
  models,
  codes,
  tools,
} = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { LeaveTypeEntity, modelCodes } = require('../../domain');

function _transform(doc) {
  if (!doc) {
    return undefined;
  }
  const entity = new LeaveTypeEntity().bind(doc).bindObjectId(doc._id.toString());
  return entity;
}

class LeaveTypeRepository {
  static async find(companyId = '') {
    const col = DefaultDBClient.getCollection(modelCodes.LEAVETYPE);
    const query = {
      companyId,
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

  static async update(leaveTypeEntity) {
    delete leaveTypeEntity.__vn;
    const col = DefaultDBClient.getCollection(modelCodes.LEAVETYPE);
    const query = {
      companyId: leaveTypeEntity.companyId,
      valid: true,
    };

    try {
      const res = await col.updateOne(query, { $set: leaveTypeEntity, $inc: { __vn: 1 } }, { upsert: true });
      return tools.CustomValidator.isEqual(res.nModified, 1);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = LeaveTypeRepository;
