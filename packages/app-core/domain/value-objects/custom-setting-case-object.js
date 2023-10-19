/**
 * FeaturePath: Common-Entity--機構個案參數設定物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-setting-case-object.js
 * Project: @erpv3/app-core
 * File Created: 2023-05-10 10:41:08 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class CustomSettingCaseObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {boolean}
     * @description 日照個案是否要顯示表單區塊
     * @member {boolean}
     */
    this.showFormMenu = null;
    /**
     * @type {boolean}
     * @description 是否計算機構與個案居住地的交通距離，預設為不開啟
     * @member {boolean}
     */
    this.supportCalculateWithCaseDistance = null;
    /**
     * @type {boolean}
     * @description 顯示居服評鑑表單
     * @member {boolean}
     */
    this.supportCaseEvaluation = null;
    /**
     * @type {boolean}
     * @description 是否限制關帳後才能取得個案收據
     * @member {boolean}
     */
    this.supportCaseReceiptAfterClose = null;
    /**
     * @type {boolean}
     * @description 個案是否顯示福利別
     * @member {boolean}
     */
    this.supportWelfare = null;
    /**
     * @type {boolean}
     * @description 是否開啟日照個案頁面的日照評鑑表單功能
     * @member {boolean}
     */
    this.useDaycaseAccreditationForm = null;
    /**
     * @type {boolean}
     * @description 是否使用身障生活補助
     * @member {boolean}
     */
    this.useDisabilityLivingAllowance = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = CustomSettingCaseObject;
