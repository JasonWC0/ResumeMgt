/**
 * FeaturePath: Common-Entity--機構TOCC參數設定物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-setting-tocc-object.js
 * Project: @erpv3/app-core
 * File Created: 2023-05-10 10:41:08 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class CustomSettingToccObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {boolean}
     * @description 是否統計未排班員工TOCC紀錄
     * @member {boolean}
     */
    this.calculateUnShiftEmployeeTOCC = null;
    /**
     * @type {boolean}
     * @description displayTOCCFillDate
     * @member {boolean}
     */
    this.displayTOCCFillDate = null;
    /**
     * @type {number}
     * @description 打下班卡時該班個案[TOCC]未填寫則不允許下班
     * @member {number}
     */
    this.needShiftToccWhenClockOut = null;
    /**
     * @type {boolean}
     * @description 是否支援TOCC評估表功能(此設定會連動至APP頁面)
     * @member {boolean}
     */
    this.supportToccForm = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = CustomSettingToccObject;
