/**
 * FeaturePath: Common-Entity--Ａ單位個管聯絡資訊
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class CaseManagerInfoObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} name
     * @description 姓名
     * @member {string}
     */
    this.name = '';
    /**
     * @type {string} phone
     * @description 聯絡電話
     * @member {string}
     */
    this.phone = '';
    /**
     * @type {string} email
     * @description email
     * @member {string}
     */
    this.email = '';
    /**
     * @type {string} org
     * @description 單位名稱
     * @member {string}
     */
    this.org = '';
  }

  bindHtml(data) {
    this.name = data.name;
    this.phone = data.telephone;
    this.email = data.email;
    this.org = data.unit;
    return this;
  }

  /**
   * @method
   * @description bind CaseListResObject
   * @param {objet} data
   * @returns {CaseListResObject} this
   */
  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = CaseManagerInfoObject;
