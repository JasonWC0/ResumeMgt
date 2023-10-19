/**
 * FeaturePath: Common-Entity--機構員工角色
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: role-authorization-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-18 10:43:47 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const BaseEntity = require('./base-entity');

/**
 * @class
 * @classdesc RoleAuthorizationEntity
 */
class RoleAuthorizationEntity extends BaseEntity {
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
     * @type {number} role
     * @description 員工角色
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
     * @type {number} manageAuthLevel
     * @description 管理角色權限等級
     * @member
     */
    this.manageAuthLevel = '';
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
    /**
     * @type {boolean} isDefault
     * @description 預設角色
     * @member
     */
    this.isDefault = null;
  }

  bindDB(data) {
    super.bind(data, this);
    this.companyId = data.companyId.toString();
    return this;
  }

  withCompanyId(companyId) {
    this.companyId = companyId;
    return this;
  }

  withRole(role) {
    this.role = role;
    return this;
  }

  withIsDefault(isDefault) {
    this.isDefault = isDefault;
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
      companyId: this.companyId,
      role: this.role,
      name: this.name,
      manageAuthLevel: this.manageAuthLevel,
      pageAuth: this.pageAuth,
      reportAuth: this.reportAuth,
      isDefault: this.isDefault,
      vn: this.__vn,
    };
  }
}

module.exports = RoleAuthorizationEntity;
