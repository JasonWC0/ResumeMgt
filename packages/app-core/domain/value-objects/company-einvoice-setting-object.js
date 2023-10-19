/**
 * FeaturePath: Common-Entity--機構電子發票設定物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: company-einvoice-setting-object.js
 * Project: @erpv3/app-core
 * File Created: 2023-03-10 06:12:33 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { BaseBundle } = require('@erpv3/app-common/custom-models');

class CompanyEInvoiceSetting extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {Object} ecPay
     * @description 綠界設定
     * @member
     */
    this.ecPay = {
      /**
       * @type {String} ecPay
       * @description 特店編號Id
       * @member
       */
      merchantId: '',
      /**
       * @type {String} hashKey
       * @description hashKey
       * @member
       */
      hashKey: '',
      /**
       * @type {String} hashIV
       * @description hashIV
       * @member
       */
      hashIV: '',
    };
  }

  bind(data) {
    super.bind(data, this);
    this.bindECPay(data.ecPay);
    return this;
  }

  bindECPay(ecPay) {
    this.ecPay = {
      merchantId: ecPay?.merchantId || '',
      hashKey: ecPay?.hashKey || '',
      hashIV: ecPay?.hashIV || '',
    };
  }
}

module.exports = CompanyEInvoiceSetting;
