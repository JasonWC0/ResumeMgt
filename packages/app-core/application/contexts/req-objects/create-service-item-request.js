/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const {
  coreErrorCodes,
  companyServiceCodes,
} = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class CreateServiceItemRequest extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
    * @type {object} dataObj
    * @description String to Object
    * @member
    */
    this.dataObj = {};
    /**
    * @type {String} serviceCode
    * @description String
    * @member
    */
    this.serviceCode = '';
    /**
    * @type {String} serviceName
    * @description String
    * @member
    */
    this.serviceName = '';
    /**
    * @type {Number} serviceCategory
    * @description Number
    * @member
    */
    this.serviceCategory = null;
    /**
    * @type {Number} description
    * @description Number
    * @member
    */
    this.description = '';
    /**
    * @type {Number} cost
    * @description Number
    * @member
    */
    this.cost = null;
    /**
    * @type {Number} timeRequired
    * @description Number
    * @member
    */
    this.timeRequired = null;
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  bindDescription(description = '') {
    this.description = description;
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.serviceName, coreErrorCodes.ERR_SERVICE_ITEM_SERVICE_NAME_IS_EMPTY)
      .nonEmptyStringThrows(this.description, coreErrorCodes.ERR_SERVICE_ITEM_DESCRIPTION_IS_EMPTY)
      .checkThrows(this.cost, { m: coreErrorCodes.ERR_SERVICE_ITEM_COST_IS_EMPTY, fn: (val) => CustomValidator.isNumber(val) })
      .checkThrows(this.timeRequired, { m: coreErrorCodes.ERR_SERVICE_ITEM_TIME_REQUIRED_IS_EMPTY, fn: (val) => CustomValidator.isNumber(val) })
      .checkThrows(this.serviceCategory,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_SERVICE_ITEM_SERVICE_CATEGORY_IS_EMPTY },
        { m: coreErrorCodes.ERR_SERVICE_CATEGORY_WRONG_VALUE, fn: (val) => Object.values(companyServiceCodes).includes(val) });
    return this;
  }
}

module.exports = CreateServiceItemRequest;
