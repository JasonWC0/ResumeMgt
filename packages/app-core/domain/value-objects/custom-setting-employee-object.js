/**
 * FeaturePath: Common-Entity--機構員工參數設定物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-setting-employee-object.js
 * Project: @erpv3/app-core
 * File Created: 2023-05-10 10:41:08 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class CustomSettingEmployeeObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {boolean}
     * @description 專員篩選，只顯示該專員負責的個案/員工
     * @member {boolean}
     */
    this.filterBySuhc = null;
    /**
     * @type {boolean}
     * @description 預設督導是否顯示所屬個案
     * @member {boolean}
     */
    this.supervisorShowBelong = null;
    /**
     * @type {boolean}
     * @description 是否支援員工生理量測(此設定會連動至APP提示與頁面及WEB頁面)
     * @member {boolean}
     */
    this.supportEmployeeVitalSignsRecord = null;
    /**
     * @type {boolean}
     * @description 是否支援足跡功能(此設定會連動至APP頁面)
     * @member {boolean}
     */
    this.supportFootprintRecord = null;
    /**
     * @type {boolean}
     * @description 是否啟用居服員未填足跡紀錄提醒服務
     * @member {boolean}
     */
    this.supportFootprintRemind = null;
    /**
     * @type {boolean}
     * @description 是否開啟權限設定功能
     * @member {boolean}
     */
    this.useRoleAuthoritySetting = null;
    /**
     * @type {number}
     * @description 員工每周最大工時
     * @member {number}
     */
    this.weekHours = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = CustomSettingEmployeeObject;
