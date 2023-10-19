/**
 * FeaturePath: Common-Entity--顧客飲食檔案物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const coreErrorCodes = require('../enums/error-codes');
const mealCodes = require('../enums/meal-codes');
const dessertCodes = require('../enums/dessert-codes');

const DEFAULT = {
  meal: mealCodes.meatDiet,
  processMethod: '無處理',
  mealSize: '正常',
  dessert: dessertCodes.none,
};

/**
 * @class
 * @classdesc Represents customer object
 */
class CustomerFoodFileObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {Number} meal
     * @description 膳食種類
     * @member
     */
    this.meal = null;
    /**
     * @type {String} processMethod
     * @description 膳食處理方式
     * @member
     */
    this.processMethod = null;
    /**
     * @type {String} mealSize
     * @description 飯量
     * @member
     */
    this.mealSize = null;
    /**
     * @type {Number} dessert
     * @description 點心
     * @member
     */
    this.dessert = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
   * @預設餐飲檔案
   * @returns {Object}
   */
  setDefault() {
    this.meal = DEFAULT.meal;
    this.processMethod = DEFAULT.processMethod;
    this.mealSize = DEFAULT.mealSize;
    this.dessert = DEFAULT.dessert;
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    if (this.meal) {
      new CustomValidator()
        .checkThrows(this.meal, {
          m: coreErrorCodes.ERR_FOOD_FILE_MEAL_WRONG_VALUE,
          fn: (val) => Object.values(mealCodes).includes(val),
        });
    }
    if (this.dessert) {
      new CustomValidator()
        .checkThrows(this.dessert, {
          m: coreErrorCodes.ERR_FOOD_FILE_DESSERT_WRONG_VALUE,
          fn: (val) => Object.values(dessertCodes).includes(val),
        });
    }
    return this;
  }

  /**
  * @method
  * @description Return formated info
  * @returns {Object}
  */
  responseInfo() {
    return {
      meal: this.meal,
      processMethod: this.processMethod,
      mealSize: this.mealSize,
      dessert: this.dessert,
    };
  }
}

module.exports = CustomerFoodFileObject;
