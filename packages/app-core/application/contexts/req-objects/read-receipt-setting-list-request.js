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
class ReadReceiptSettingListRequest extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
    * @type {String} companyId
    * @description company ID
    * @member
    */
    this.companyId = '';
    /**
    * @type {String} reportType
    * @description String
    * @member
    */
    this.reportType = '';
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
    new CustomValidator().nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY);
    return this;
  }
}

module.exports = ReadReceiptSettingListRequest;
