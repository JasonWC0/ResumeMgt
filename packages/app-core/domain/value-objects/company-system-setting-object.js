/**
 * FeaturePath: Common-Entity--機構參數設定物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: company-system-setting-object.js
 * Project: @erpv3/app-core
 * File Created: 2022-05-26 04:03:14 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const serviceItemBA02UnitCodes = require('../enums/service-item-BA02-unit-codes');

class CompanySystemSetting extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {boolean} isAdvancedSalaryMthEE
     * @description 是否進階薪資設定月薪制員工職別
     * @member
     */
    this.isAdvancedSalaryMthEE = null;
    /**
     * @type {number} serviceItemBA02Unit
     * @description 服務項目BA02的計算單位
     * @member
     */
    this.serviceItemBA02Unit = serviceItemBA02UnitCodes.one;
    /**
     * @type {string} feeApplyOrgNo
     * @description 支審系統-服務單位代碼
     * @member
     */
    this.feeApplyOrgNo = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = CompanySystemSetting;
