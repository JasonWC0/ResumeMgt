/**
 * FeaturePath: Common-Entity--機構參數設定物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-setting-company-object.js
 * Project: @erpv3/app-core
 * File Created: 2023-05-10 10:41:08 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class CustomSettingCompanyObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {boolean} hideEmployeeSalary
     * @description 是否隱藏員工薪資設定
     * @member {boolean}
     */
    this.hideEmployeeSalary = null;
    /**
     * @type {boolean} hideSalaryReport
     * @description 是否隱藏服務時數薪資報表
     * @member {boolean}
     */
    this.hideSalaryReport = null;
    /**
     * @type {boolean} isTest
     * @description 是否為測試站點(使內部統計報表不統計此公司相關的資訊)
     * @member {boolean}
     */
    this.isTest = null;
    /**
     * @type {boolean} useWyForm
     * @description 是否使用華仁客製版表單
     * @member {boolean}
     */
    this.useWyForm = null;
    /**
     * @type {number} arrangePunchRecordAllowanceQuotaDC
     * @description 日照給付額度分配到出勤紀錄的優先順序
     * @member {number}
     */
    this.arrangePunchRecordAllowanceQuotaDC = null;
    /**
     * @type {number} enableCompanyDashboard
     * @description 機構參數-啟用機構儀表板
     * @member {number}
     */
    this.enableCompanyDashboard = null;
    /**
     * @type {number} receiptSerialNumber
     * @description 收據流水號
     * @member {number}
     */
    this.receiptSerialNumber = null;
    /**
     * @type {boolean} supportCareManagement
     * @description 支援聯護系統
     * @member {boolean}
     */
    this.supportCareManagement = null;
    /**
     * @type {boolean} supportGroupManager
     * @description 支援群組管理
     * @member {boolean}
     */
    this.supportGroupManager = null;
    /**
     * @type {boolean} supportHomeServiceDashboard
     * @description 是否啟用居服儀表板
     * @member {boolean}
     */
    this.supportHomeServiceDashboard = null;
    /**
     * @type {boolean} useOnlineService
     * @description 是否使用線上客服功能
     * @member {boolean}
     */
    this.useOnlineService = null;
    /**
     * @type {boolean} useProPlan
     * @description 是否開啟「專業照顧計畫」相關功能
     * @member {boolean}
     */
    this.useProPlan = null;
    /**
     * @type {boolean} useRNProPlan
     * @description 是否開啟護理專業照顧計畫
     * @member {boolean}
     */
    this.useRNProPlan = null;
    /**
     * @type {boolean} usePTProPlan
     * @description 是否開啟物理/職能專業照顧計畫
     * @member {boolean}
     */
    this.usePTProPlan = null;
    /**
     * @type {boolean} useRDProPlan
     * @description 是否開啟營養專業照顧計畫
     * @member {boolean}
     */
    this.useRDProPlan = null;
    /**
     * @type {boolean} useReceiptSerialNumber
     * @description 是否使用收據流水號(顯示於個案收據)
     * @member {boolean}
     */
    this.useReceiptSerialNumber = null;
    /**
     * @type {boolean} customizeActivityShowImage
     * @description 是否支援活動顯示照片
     * @member {boolean}
     */
    this.customizeActivityShowImage = null;
    /**
     * @type {boolean} showAllActivityForCase
     * @description 是否顯示全部活動
     * @member {boolean}
     */
    this.showAllActivityForCase = null;
    /**
     * @type {boolean} useSWProPlan
     * @description 是否開啟社工專業照顧計畫
     * @member {boolean}
     */
    this.useSWProPlan = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = CustomSettingCompanyObject;
