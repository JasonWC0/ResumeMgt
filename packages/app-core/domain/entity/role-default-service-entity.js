/**
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設角色(新增員工角色)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設角色(編輯員工角色)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設角色(檢視員工角色)
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: role-default-service-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-12 02:07:34 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomUtils } = require('@erpv3/app-common/custom-tools');
const BaseEntity = require('./base-entity');

/**
* @class
* @classdesc RoleDefaultServiceEntity
*/
class RoleDefaultServiceEntity extends BaseEntity {
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
     * @type {string} serviceGroupCode
     * @description 服務類型組別
     * @member
     */
    this.serviceGroupCode = '';
    /**
     * @type {string} role
     * @description 員工角色
     * @member
     */
    this.role = null;
    /**
     * @type {string} name
     * @description 角色名稱
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

  bindDB(data) {
    super.bind(data, this);
    const _serviceGroup = CustomUtils.deepCopy(this.serviceGroupId);
    this.serviceGroupId = _serviceGroup._id.toString();
    this.serviceGroupCode = _serviceGroup.code;
    return this;
  }

  withManageAuthLevel(manageAuthLevel) {
    this.manageAuthLevel = manageAuthLevel;
    return this;
  }

  withPageAuth(pageAuth = {}) {
    this.pageAuth = pageAuth;
    return this;
  }

  withReportAuth(reportAuth = {}) {
    this.reportAuth = reportAuth;
    return this;
  }

  toView() {
    return {
      id: this.id,
      serviceGroupId: this.serviceGroupId,
      serviceGroupCode: this.serviceGroupCode,
      role: this.role,
      pageAuth: this.pageAuth,
      reportAuth: this.reportAuth,
      vn: this.__vn,
    };
  }
}

module.exports = RoleDefaultServiceEntity;
