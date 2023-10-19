/**
 * FeaturePath: Common-Entity--個案健康檔案物件
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
const disabilityCategoryTypeCodes = require('../enums/disability-category-type-codes');
const disabilityItemCodes = require('../enums/disability-item-codes');
const cmsLevelCodes = require('../enums/cms-level-codes');

/**
 * @class
 * @classdesc Represents customer object
 */
class CaseHealthFileObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {number} cmsLevel
     * @description CMS等級
     * @member {number}
     */
    this.cmsLevel = null;
    /**
     * @type {Number} disabilityCategoryType
     * @description 身障類別制度
     * @member
     */
    this.disabilityCategoryType = null;
    /**
     * @type {Boolean} disabilityCertification
     * @description 是否具備身心障礙失智症手冊/證明或CDR1分以上)
     * @member
     */
    this.disabilityCertification = null;
    /**
     * @type {Array<Number>} newDisabilityCategories
     * @description 身障類別(新)
     * @member
     */
    this.newDisabilityCategories = null;
    /**
     * @type {String} oldDisabilityCategories
     * @description 身障類別(舊)
     * @member
     */
    this.oldDisabilityCategories = null;
    /**
     * @type {Number} disabilityItem
     * @description 身障項目別
     * @member
     */
    this.disabilityItem = null;
    /**
     * @type {Boolean} isAA11aRemind
     * @description 身心障礙
     * @member
     */
    this.isAA11aRemind = null;
    /**
     * @type {Boolean} isAA11a
     * @description 身心障礙
     * @member
     */
    this.isAA11a = null;
    /**
     * @type {Boolean} isAA11b
     * @description 失智症
     * @member
     */
    this.isAA11b = null;
    /**
     * @type {Boolean} isIntellectualDisability
     * @description 是否符合身心障礙
     * @member
     */
    this.isIntellectualDisability = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    if (this.cmsLevel != null) {
      new CustomValidator()
        .checkThrows(this.cmsLevel, {
          m: coreErrorCodes.ERR_CMS_LEVEL_NOT_FOUND,
          fn: (val) => Object.values(cmsLevelCodes).includes(val),
        });
    }

    if (this.disabilityCategoryType) {
      new CustomValidator()
        .checkThrows(this.disabilityCategoryType, {
          m: coreErrorCodes.ERR_DISABILITY_CATEGORY_WRONG_VALUE,
          fn: (val) => Object.values(disabilityCategoryTypeCodes).includes(val),
        });
    }

    if (this.disabilityItem) {
      new CustomValidator()
        .checkThrows(this.disabilityItem, {
          m: coreErrorCodes.ERR_DISABILITY_ITEM_WRONG_VALUE,
          fn: (val) => Object.values(disabilityItemCodes).includes(val),
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
      cmsLevel: this.cmsLevel,
      disabilityCategoryType: this.disabilityCategoryType,
      disabilityCertification: this.disabilityCertification,
      newDisabilityCategories: this.newDisabilityCategories,
      oldDisabilityCategories: this.oldDisabilityCategories,
      disabilityItem: this.disabilityItem,
      isAA11aRemind: this.isAA11aRemind,
      isAA11a: this.isAA11a,
      isAA11b: this.isAA11b,
      isIntellectualDisability: this.isIntellectualDisability,
    };
  }
}
module.exports = CaseHealthFileObject;
