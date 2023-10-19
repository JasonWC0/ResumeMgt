/**
 * FeaturePath: Common-Entity--機構參數設定
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-setting-object.js
 * Project: @erpv3/app-core
 * File Created: 2023-05-10 10:41:08 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const CustomSettingCompanyObject = require('./custom-setting-company-object');
const CustomSettingAppObject = require('./custom-setting-app-object');
const CustomSettingCaseObject = require('./custom-setting-case-object');
const CustomSettingEmployeeObject = require('./custom-setting-employee-object');
const CustomSettingMessageObject = require('./custom-setting-message-object');
const CustomSettingReportObject = require('./custom-setting-report-object');
const CustomSettingSalaryObject = require('./custom-setting-salary-object');
const CustomSettingShiftObject = require('./custom-setting-shift-object');
const CustomSettingToccObject = require('./custom-setting-tocc-object');

class CustomSettingObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {CustomSettingCompanyObject} company
     * @description 機構-相關參數
     * @member {CustomSettingCompanyObject}
     */
    this.company = new CustomSettingCompanyObject();
    /**
     * @type {CustomSettingAppObject} app
     * @description APP-相關參數
     * @member {CustomSettingAppObject}
     */
    this.app = new CustomSettingAppObject();
    /**
     * @type {CustomSettingCaseObject} case
     * @description 個案-相關參數
     * @member {CustomSettingCaseObject}
     */
    this.case = new CustomSettingCaseObject();
    /**
     * @type {CustomSettingEmployeeObject} employee
     * @description 員工-相關參數
     * @member {CustomSettingEmployeeObject}
     */
    this.employee = new CustomSettingEmployeeObject();
    /**
     * @type {CustomSettingMessageObject} message
     * @description 訊息-相關參數
     * @member {CustomSettingMessageObject}
     */
    this.message = new CustomSettingMessageObject();
    /**
     * @type {CustomSettingReportObject} report
     * @description 報表-相關參數
     * @member {CustomSettingReportObject}
     */
    this.report = new CustomSettingReportObject();
    /**
     * @type {CustomSettingSalaryObject} salary
     * @description 薪資-相關參數
     * @member {CustomSettingSalaryObject}
     */
    this.salary = new CustomSettingSalaryObject();
    /**
     * @type {CustomSettingShiftObject} shift
     * @description 班表-相關參數
     * @member {CustomSettingShiftObject}
     */
    this.shift = new CustomSettingShiftObject();
    /**
     * @type {CustomSettingToccObject} tocc
     * @description TOCC-相關參數
     * @member {CustomSettingToccObject}
     */
    this.tocc = new CustomSettingToccObject();
  }

  bind(data) {
    super.bind(data, this);
    this.company = data.company ? new CustomSettingCompanyObject().bind(data.company) : null;
    this.app = data.app ? new CustomSettingAppObject().bind(data.app) : null;
    this.case = data.case ? new CustomSettingCaseObject().bind(data.case) : null;
    this.employee = data.employee ? new CustomSettingEmployeeObject().bind(data.employee) : null;
    this.message = data.message ? new CustomSettingMessageObject().bind(data.message) : null;
    this.report = data.report ? new CustomSettingReportObject().bind(data.report) : null;
    this.salary = data.salary ? new CustomSettingSalaryObject().bind(data.salary) : null;
    this.shift = data.shift ? new CustomSettingShiftObject().bind(data.shift) : null;
    this.tocc = data.tocc ? new CustomSettingToccObject().bind(data.tocc) : null;
    return this;
  }
}

module.exports = CustomSettingObject;
