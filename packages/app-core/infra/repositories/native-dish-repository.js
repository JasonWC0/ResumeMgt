/**
 * FeaturePath: Common-Repository--預設菜色
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: native-dish-repository.js
 * Project: @erpv3/app-core
 * File Created: 2023-05-03 02:16:25 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { LOGGER, models } = require('@erpv3/app-common');
const { NativeDBClient } = require('@erpv3/app-common/shared/connection-clients');
const coreErrorCodes = require('../../domain/enums/error-codes');

const DISH_CATEGORY_COLLECTION_NAME = 'DishCategories';
const DISH_COLLECTION_NAME = 'Dishes';
const __SC = 'Script';

class NativeDishRepository {
  /**
   * 建立菜色類別
   * @param {Array} companyIds 機構Id列表
   * @param {Array} data 菜色類別列表
   * @returns
   */
  static async createDishCategory(companyIds, data) {
    const col = NativeDBClient.getCollection(DISH_CATEGORY_COLLECTION_NAME);

    const date = new Date();
    const obj = [];
    companyIds.forEach((companyId) => {
      data.forEach((d) => {
        obj.push({
          companyId,
          name: d,
          note: '',
          createdAt: new Date(date.toISOString()),
          updatedAt: new Date(date.toISOString()),
          __vn: 0,
          __sc: __SC,
          isDelete: false,
        });
      });
    });

    try {
      await col.insertMany(obj);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(coreErrorCodes.ERR_DB_CREATE_DISH_CATEGORY);
    }
  }

  /**
   * 查詢菜色類別
   * @param {Array} companyIds 機構Id列表
   * @param {Array} names 菜色類別名稱列表
   * @returns {Array}
   */
  static async findDishCategory(companyIds, names) {
    const col = NativeDBClient.getCollection(DISH_CATEGORY_COLLECTION_NAME);
    try {
      const result = await col.find({ companyId: { $in: companyIds }, name: { $in: names } }, { _id: 1, companyId: 1, name: 1 }).toArray();
      return result;
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(coreErrorCodes.ERR_DB_FIND_DISH_CATEGORY);
    }
  }

  /**
   * 建立菜色
   * @param {Array} companyIds 機構Id列表
   * @param {Array} dishCategoryData 菜色類別資料列表
   * @param {Array} data 菜色列表
   */
  static async createDish(companyIds, dishCategoryData, data) {
    const col = NativeDBClient.getCollection(DISH_COLLECTION_NAME);

    const date = new Date();
    const obj = [];
    companyIds.forEach((companyId) => {
      data.forEach((d) => {
        const category = dishCategoryData.find((dc) => (dc.companyId === companyId && dc.name === d[1]))._id || null;
        obj.push({
          companyId,
          name: d[0],
          category,
          nutrition: {
            portion: Number(d[2]),
            portionUnit: d[3],
            portionDesc: d[4],
            calories: Number(d[5]),
            protein: Number(d[6]),
            totalFat: Number(d[7]),
            carbohydrates: Number(d[8]),
            dietaryFiber: Number(d[9]),
          },
          createdAt: new Date(date.toISOString()),
          updatedAt: new Date(date.toISOString()),
          __vn: 0,
          __sc: __SC,
          isDelete: false,
        });
      });
    });

    try {
      await col.insertMany(obj);
    } catch (ex) {
      LOGGER.error(ex.stack);
      throw new models.CustomError(coreErrorCodes.ERR_DB_CREATE_DISH);
    }
  }
}

module.exports = NativeDishRepository;
