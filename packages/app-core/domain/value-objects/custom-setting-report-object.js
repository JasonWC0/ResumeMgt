/**
 * FeaturePath: Common-Entity--機構報表參數設定物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-setting-report-object.js
 * Project: @erpv3/app-core
 * File Created: 2023-05-10 10:41:08 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class CustomSettingReportObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {boolean}
     * @description 日照個案收據僅顯示有服務紀錄
     * @member {boolean}
     */
    this.caseReceiptDcOnlyShowService = null;
    /**
    * @type {boolean}
    * @description 機構參數-個案收據機構資訊欄位是否需要加大
    * @member {boolean}
    */
    this.caseReceiptEnlargeCompanyInfo = null;
    /**
    * @type {boolean}
    * @description 機構參數-"個案收據/個案收費單"是否一律使用一般價
    * @member {boolean}
    */
    this.caseReceiptUseGeneralPrice = null;
    /**
    * @type {number}
    * @description 中央服務紀錄分割一個檔案的紀錄數量上限
    * @member {number}
    */
    this.countUpperLimit = null;
    /**
    * @type {boolean}
    * @description 個案收費單中是否包含個案收據
    * @member {boolean}
    */
    this.customerReceipt = null;
    /**
    * @type {boolean}
    * @description 在居服員紀錄表單中，是否顯示個案案號
    * @member {boolean}
    */
    this.employeeServiceRecordShowCustomCode = null;
    /**
    * @type {number}
    * @description 報表產生間隔時間(分鐘)
    * @member {number}
    */
    this.reportCreateIntervalTime = null;
    /**
    * @type {string}
    * @description 服務顯示名稱(用於居服個案收據(公版)、居服個案收費單(標準版/簡易版))
    * @member {string}
    */
    this.serviceDisplayName = null;
    /**
    * @type {boolean}
    * @description 顯示分析報表 -> 分析圖表
    * @member {boolean}
    */
    this.showAnalysisChart = null;
    /**
    * @type {boolean}
    * @description 個案收費單中是否顯示原價
    * @member {boolean}
    */
    this.showOriginalPrice = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = CustomSettingReportObject;
