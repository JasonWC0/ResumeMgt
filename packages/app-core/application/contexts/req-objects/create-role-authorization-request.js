/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-role-authorization-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-18 05:08:04 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle, CustomError } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, manageAuthLevelCodes } = require('../../../domain');
const { employeeMap, getNumberBooleanKey } = require('../../../domain/enums/mapping');

/**
* @class
* @classdesc inherit BaseBundle
*/
class CreateRoleAuthorizationRequest extends BaseBundle {
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
     * @type {string} name
     * @description 員工角色名稱
     * @member
     */
    this.name = '';
    /**
     * @type {number} manageAuthLevel
     * @description 管理角色權限等級
     * @member
     */
    this.manageAuthLevel = null;
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
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .nonEmptyStringThrows(this.name, coreErrorCodes.ERR_ROLE_AUTHORIZATION_NAME_EMPTY)
      .checkThrows(this.manageAuthLevel,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_MANAGE_AUTH_LEVEL_EMPTY },
        { fn: (val) => Object.values(manageAuthLevelCodes).includes(val), m: coreErrorCodes.ERR_MANAGE_AUTH_LEVEL_WRONG_VALUE });

    if (getNumberBooleanKey(employeeMap.employeeRoleMaps, this.name)) {
      throw new CustomError(coreErrorCodes.ERR_THE_ROLE_NAME_IS_DEFAULT);
    }
    return this;
  }
}

module.exports = CreateRoleAuthorizationRequest;
