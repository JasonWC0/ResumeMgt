/**
 * FeaturePath: Common-Entity--C碼服務項目預設值
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: ccode-template-setting-object.js
 * Project: @erpv3/app-core
 * File Created: 2023-05-09 04:05:05 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class CCodeTemplateSettingObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} revivalGoal
     * @description 復能目標
     * @member {string}
     */
    this.revivalGoal = '';
    /**
     * @type {string} revivalAccomplish
     * @description 復能目標達成情形
     * @member {string}
     */
    this.revivalAccomplish = '';
    /**
     * @type {string} revivalTarget
     * @description 指導對象
     * @member {string}
     */
    this.revivalTarget = '';
    /**
     * @type {string} revivalContent
     * @description 服務內容
     * @member {string}
     */
    this.revivalContent = '';
    /**
     * @type {string} revivalSummary
     * @description 指導建議摘要
     * @member {string}
     */
    this.revivalSummary = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = CCodeTemplateSettingObject;
