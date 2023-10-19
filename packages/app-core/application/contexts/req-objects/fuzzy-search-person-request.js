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
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class FuzzySearchEmployeeRequest extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
    * @type {string} corpId
    * @description 總公司ID
    * @member
    */
    this.corpId = '';
    /**
     * @type {string} name
     * @description 姓名
     * @member
     */
    this.name = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.name, coreErrorCodes.ERR_PERSON_NAME_IS_EMPTY)
      .nonEmptyStringThrows(this.corpId, coreErrorCodes.ERR_CORPORATION_ID_IS_EMPTY);
    return this;
  }
}

module.exports = FuzzySearchEmployeeRequest;
