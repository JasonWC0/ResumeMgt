/**
 * FeaturePath: Common-Entity--基本架構
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: base-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-07 02:37:25 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

/**
* @class
* @classdesc FormEntity
*/
class BaseEntity extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {boolean} valid
     * @description 資料是否有效
     * @member
     */
    this.valid = null;
    /**
     * @type {number} __vn
     * @description 版本號碼
     * @member
     */
    this.__vn = null;
    /**
     * @type {string} __cc
     * @description 資料檢查碼
     * @member
     */
    this.__cc = '';
    /**
     * @type {string} __sc
     * @description 來源服務號碼
     * @member
     */
    this.__sc = '';
    /**
     * @type {ObjectId} creator
     * @description 資料建造者
     * @member
     */
    this.creator = null;
    /**
     * @type {ObjectId} modifier
     * @description 最後編輯者
     * @member
     */
    this.modifier = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  bindObjectId(id) {
    this.id = id;
    return this;
  }

  bindBaseInfo(baseInfo = {}) {
    this.__cc = baseInfo.__cc;
    this.__sc = baseInfo.__sc;
    this.__vn = baseInfo.__vn;
    return this;
  }

  bindCreator(creator) {
    this.creator = creator;
    return this;
  }

  bindModifier(modifier) {
    this.modifier = modifier;
    return this;
  }

  invalid() {
    this.valid = false;
    return this;
  }
}

module.exports = BaseEntity;
