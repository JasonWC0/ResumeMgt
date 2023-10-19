/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-service-group-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-05 04:08:42 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class CreateServiceGroupRequest extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {String} code
     * @description 服務類型組別
     * @member
     */
    this.code = '';
    /**
     * @type {String} name
     * @description 顯示文字
     * @member
     */
    this.name = '';
    /**
     * @type {object} pageAuth
     * @description 選單/頁面功能設定
     * @member
     */
    this.pageAuth = {};
    /**
     * @type {object} reportAuth
     * @description 報表群/報表功能設定
     * @member
     */
    this.reportAuth = {};
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
      .nonEmptyStringThrows(this.code, coreErrorCodes.ERR_SERVICE_GROUP_CODE_IS_EMPTY)
      .nonEmptyStringThrows(this.name, coreErrorCodes.ERR_SERVICE_GROUP_NAME_IS_EMPTY);
    return this;
  }
}

module.exports = CreateServiceGroupRequest;
