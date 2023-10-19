/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: read-company-form-list-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-07 03:11:40 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class ReadCompanyFormListRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} companyId
     * @description 公司Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} category
     * @description 表單主類別
     * @member
     */
    this.category = '';
    /**
     * @type {string} serviceType
     * @description 服務類別
     * @member
     */
    this.serviceType = '';
    /**
     * @type {string} history
     * @description 撈取歷史表單範本
     * @member
     */
    this.history = false;
    /**
     * @type {boolean} valid
     * @description 表單開通
     * @member
     */
    this.valid = true;
    /**
     * @type {boolean} hasFrequency
     * @description 是否有頻率
     * @member
     */
    this.hasFrequency = null;
  }

  bind(data) {
    super.bind(data, this);

    this.category = CustomValidator.nonEmptyString(this.category) ? this.category.split(',') : '';
    this.serviceType = CustomValidator.nonEmptyString(this.serviceType) ? this.serviceType.split(',') : '';
    this.history = CustomUtils.convertBoolean(this.history, false);
    this.valid = CustomUtils.convertBoolean(this.valid, true);
    this.hasFrequency = CustomUtils.convertBoolean(this.hasFrequency);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY);
    return this;
  }
}

module.exports = ReadCompanyFormListRequest;
