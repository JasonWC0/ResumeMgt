/**
 * FeaturePath: Common-Repository--方案
 * Accountable: JoyceS Hsu, AndyH Lai
 */
const { LOGGER, models, codes } = require('@erpv3/app-common');
const { DefaultDBClient } = require('@erpv3/app-common/shared/connection-clients');
const { modelCodes } = require('../../domain');

class ProgramRepository {
  /**
   * @param {Array<String>} services service item ids
   * @return {Promise.<Array<String>>} return all of the same service item ids
   */
  static async findUsedService(services) {
    const col = DefaultDBClient.getCollection(modelCodes.PROGRAM);
    const obj = {
      $or: [{ mealService: { $in: services } }, { careService: { $in: services } }],
      isDelete: false,
    };
    try {
      const usedAry = [];
      const res = await col.find(obj, { _id: 0, mealService: 1, careService: 1 });
      res.forEach((doc) => {
        if (services.includes(doc.mealService)) {
          usedAry.push(doc.mealService);
        }
        if (services.includes(doc.careService)) {
          usedAry.push(doc.careService);
        }
      });
      return usedAry;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(codes.errorCodes.ERR_EXEC_DB_FAIL);
    }
  }
}

module.exports = ProgramRepository;
