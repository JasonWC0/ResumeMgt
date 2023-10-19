/**
 * FeaturePath: Common-Entity--Ａ單位服務項目物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: aorg-service-item-object.js
 * Project: @erpv3/app-core
 * File Created: 2022-06-06 05:58:03 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class AOrgServiceItemObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} item
     * @description 照顧清單(服務項目之細項)
     * @member {string}
     */
    this.item = '';
    /**
     * @type {string} careManagerName
     * @description 照專姓名
     * @member {string}
     */
    this.careManagerName = '';
    /**
     * @type {string} aOrgName
     * @description A單位名稱
     * @member {string}
     */
    this.aOrgName = '';
    /**
     * @type {string} reason
     * @description 擬定之原因說明
     * @member {string}
     */
    this.reason = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  bindHtml(data) {
    this.item = data.item;
    this.careManagerName = data.name;
    this.aOrgName = data.unit;
    this.reason = data.reason;
    return this;
  }
}

module.exports = AOrgServiceItemObject;
