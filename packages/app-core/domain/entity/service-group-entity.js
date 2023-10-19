/**
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設功能(新增服務)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設功能(編輯服務)
 * FeaturePath: 仁寶平台管理-營運管理-開站設定-服務預設功能(檢視服務)
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: service-group-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-01 03:17:10 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const BaseEntity = require('./base-entity');

/**
 * @class
 * @classdesc ServiceGroupEntity
 */
class ServiceGroupEntity extends BaseEntity {
  /**
    * @constructor
    */
  constructor() {
    super();
    /**
     * @type {string} _id
     * @description ObjectId
     * @member
     */
    this._id = '';
    /**
     * @type {string} code
     * @description 服務類型組別
     * @member
     */
    this.code = '';
    /**
     * @type {string} name
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
      code: this.code,
      name: this.name,
      pageAuth: this.pageAuth,
      reportAuth: this.reportAuth,
      vn: this.__vn,
    };
  }
}

module.exports = ServiceGroupEntity;
