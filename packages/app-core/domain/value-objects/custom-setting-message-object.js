/**
 * FeaturePath: Common-Entity--機構訊息參數設定物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-setting-message-object.js
 * Project: @erpv3/app-core
 * File Created: 2023-05-10 10:41:08 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class CustomSettingMessageObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {boolean}
     * @description 是否支援家屬APP
     * @member {boolean}
     */
    this.supportAppCustomer = null;
    /**
     * @type {boolean}
     * @description 是否支援居服APP
     * @member {boolean}
     */
    this.supportAppEmployee = null;
    /**
     * @type {boolean}
     * @description 是否支援RN-APP
     * @member {boolean}
     */
    this.supportAppRN = null;
    /**
     * @type {boolean}
     * @description 家庭聯絡簿更動是否發送訊息通知(不包含親職溝通)
     * @member {boolean}
     */
    this.contactBookSendNotify = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = CustomSettingMessageObject;
