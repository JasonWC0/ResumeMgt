/**
 * FeaturePath: Common-Entity--自費服務項目選項
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class ServiceOptionObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} seq
     * @description seq
     * @member {string}
     */
    this.seq = '';
    /**
     * @type {string} description
     * @description description
     * @member {string}
     */
    this.description = '';
    /**
     * @type {string} method
     * @description method
     * @member {string}
     */
    this.method = null;
    /**
     * @type {string} methodDesc
     * @description methodDesc
     * @member {string}
     */
    this.methodDesc = '';
    /**
     * @type {string} itemExclude
     * @description itemExclude
     * @member {string}
     */
    this.itemExclude = '';
    /**
     * @type {string} itemRely
     * @description itemRely
     * @member {string}
     */
    this.itemRely = '';
    /**
     * @type {string} itemTime
     * @description itemTime
     * @member {Number}
     */
    this.itemTime = null;
    /**
     * @type {string} type
     * @description type
     * @member {Number}
     */
    this.type = null;
    /**
     * @type {string} shortDesc
     * @description shortDesc
     * @member {string}
     */
    this.shortDesc = '';
    /**
     * @type {Number} timeRequired
     * @description 服務時間預設值[排班用]
     * @member {Number}
     */
    this.timeRequired = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  toView() {
    return {
      seq: this.seq,
      method: this.method,
      methodDesc: this.methodDesc,
      itemExclude: this.itemExclude,
      itemRely: this.itemRely,
      itemTime: this.itemTime,
      type: this.type,
      shortDesc: this.shortDesc,
      timeRequired: this.timeRequired,
      description: this.description,
    };
  }
}
module.exports = ServiceOptionObject;
