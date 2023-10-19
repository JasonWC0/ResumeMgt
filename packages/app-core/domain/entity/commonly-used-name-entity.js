/**
 * FeaturePath: Common-Entity--常用名稱
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: commonly-used-name-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-08 03:13:05 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { CustomUtils } = require('@erpv3/app-common/custom-tools');
const BaseEntity = require('./base-entity');

/**
* @class
* @classdesc CommonlyUsedNameEntity
*/
class CommonlyUsedNameEntity extends BaseEntity {
  /**
* @constructor
*/
  constructor() {
    super();
    /**
     * @type {string} id
     * @description ObjectId
     * @member
     */
    this.id = '';
    /**
     * @type {string} companyId
     * @description 機構(公司)Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} type
     * @description 常用名稱類別
     * @member
     */
    this.type = '';
    /**
     * @type {string} name
     * @description 常用名稱
     * @member
     */
    this.name = [];
  }

  bind(data) {
    super.bind(data, this);
    this.name = CustomUtils.uniqueArray(this.name);
    return this;
  }

  bindDBObjectId(data) {
    super.bind(data, this);
    if (data.companyId) {
      this.companyId = data.companyId.toString();
    }
    return this;
  }

  withName(name) {
    this.name = CustomUtils.uniqueArray(name);
    return this;
  }
}

module.exports = CommonlyUsedNameEntity;
