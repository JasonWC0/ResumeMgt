/**
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-預設菜色
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: dish-controller.js
 * Project: @erpv3/backend
 * File Created: 2023-05-03 11:48:36 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const fsExtra = require('fs-extra');
const { parse } = require('csv-parse');
const { models, LOGGER } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('@erpv3/app-core/domain');
const { NativeDishRepository } = require('@erpv3/app-core/infra/repositories');

const DEFAULT_FILE = './packages/backend/configs/default/dish.csv';
const DEFAULT_DELIMITER = ',';
const DEFAULT_FROM_LINE = 2;

/**
 * 讀取csv檔案
 * @param {String} path
 * @returns {Array}
 */
async function _readCSV(_path, delimiter, fromLine) {
  const data = [];
  const parser = fsExtra.createReadStream(_path)
    .pipe(parse({ delimiter, from_line: fromLine }));
  for await (const row of parser) {
    data.push(row);
  }
  return data;
}

class DishController {
  /**
   * 初始建立機構菜色及菜色類別(開站)
   * @param {Object} ctx context
   * @param {Object} next
   */
  static async init(ctx, next) {
    const { companyIds } = ctx.request.body;
    CustomValidator.nonEmptyArray(companyIds, coreErrorCodes.ERR_COMPANY_ID_EMPTY);

    const csvData = await _readCSV(DEFAULT_FILE, DEFAULT_DELIMITER, DEFAULT_FROM_LINE);
    const dishCategories = [...new Set(csvData.map((d) => d[1]))];
    await NativeDishRepository.createDishCategory(companyIds, dishCategories);
    const dishCategoryRes = await NativeDishRepository.findDishCategory(companyIds, dishCategories);
    await NativeDishRepository.createDish(companyIds, dishCategoryRes, csvData);
    LOGGER.info(`Init Dish & Dish-Category for Company: ${companyIds}`);

    ctx.state.result = new models.CustomResult();
    await next();
  }
}

module.exports = DishController;
