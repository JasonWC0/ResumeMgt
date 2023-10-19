/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-role-default-service-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-12 02:46:18 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, employeeRoleCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class CreateRoleDefaultServiceRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
    * @type {string} serviceGroupId
    * @description 服務類型Id
    * @member
    */
    this.serviceGroupId = '';
    /**
     * @type {number} role
     * @description 角色
     * @member
     */
    this.role = '';
    /**
     * @type {string} name
     * @description 角色名稱
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

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.serviceGroupId, coreErrorCodes.ERR_SERVICE_GROUP_ID_EMPTY)
      .checkThrows(this.role,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_ROLE_EMPTY },
        { fn: (val) => Object.values(employeeRoleCodes).includes(val), m: coreErrorCodes.ERR_ROLE_WRONG_FORMAT })
      .nonEmptyStringThrows(this.name, coreErrorCodes.ERR_ROLE_AUTHORIZATION_NAME_EMPTY);

    return this;
  }
}

module.exports = CreateRoleDefaultServiceRequest;
