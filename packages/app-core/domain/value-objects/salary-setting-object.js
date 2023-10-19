/*
 * FeaturePath: Common-Entity--員工薪資設定物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: salary-setting-object.js
 * Project: @erpv3/app-core
 * File Created: 2023-05-11 10:56:13 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class SalarySettingObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {Boolean} transitionOverTime
     * @description 兩排班時間差異超過X分鐘是否轉場 for薪資頁面
     * @member {Boolean}
     */
    this.transitionOverTime = null;
    /**
     * @type {Number} transitionOverTimeMin
     * @description 排班視為轉場的轉場時間門檻(分鐘) for薪資頁面
     * @member {Number}
     */
    this.transitionOverTimeMin = null;
    /**
     * @type {Boolean} useEmployeeSalarySettings
     * @description 是否使用員工薪資(時薪/月薪)設定 for薪資頁面
     * @member {Boolean}
     */
    this.useEmployeeSalarySettings = null;
    /**
     * @type {Boolean} useEmployeeShareSettings
     * @description 是否使用員工個別拆帳設定 for薪資頁面
     * @member {Boolean}
     */
    this.useEmployeeShareSettings = null;
    /**
     * @type {Boolean} workHourIncludesTransition
     * @description 轉場是否納入工時 for薪資頁面
     * @member {Boolean}
     */
    this.workHourIncludesTransition = null;
    /**
     * @type {String} bankAccount
     * @description 銀行帳號 for薪資頁面
     * @member {String}
     */
    this.bankAccount = null;
    /**
     * @type {Object} additionalSetting
     * @description 額外客製設定 for薪資頁面
     * @member {Object}
     */
    this.additionalSetting = null;
    /**
     * @type {Boolean} changeFieldDefault
     * @description 員工轉場是否使用機構薪資管理之設定 for薪資頁面
     * @member {Boolean}
     */
    this.changeFieldDefault = null;
    /**
     * @type {Number} changeFieldDisplayCountType
     * @description 轉場設定 - 計算方式 - 計次方式
     * @member {Number}
     */
    this.changeFieldDisplayCountType = null;
    /**
     * @type {Number} changeFieldHolidayWage
     * @description 轉場時薪 - 假日 for薪資頁面
     * @member {Number}
     */
    this.changeFieldHolidayWage = null;
    /**
     * @type {Number} changeFieldHolidayWagePerTime
     * @description 每次轉場薪資 - 假日 for薪資頁面
     * @member {Number}
     */
    this.changeFieldHolidayWagePerTime = null;
    /**
     * @type {Number} changeFieldNormalWagePerTime
     * @description 每次轉場薪資 - 平日 for薪資頁面
     * @member {Number}
     */
    this.changeFieldNormalWagePerTime = null;
    /**
     * @type {Number} changeFieldPeriod
     * @description 轉場設定 - 預設每次轉場時間 for薪資頁面
     * @member {Number}
     */
    this.changeFieldPeriod = null;
    /**
     * @type {Number} changeFieldRest
     * @description 轉場設定 - 休息時間 for薪資頁面
     * @member {Number}
     */
    this.changeFieldRest = null;
    /**
     * @type {Number} changeFieldSalaryPerKm
     * @description 轉場設定 - 每公里薪資 for薪資頁面
     * @member {Number}
     */
    this.changeFieldSalaryPerKm = null;
    /**
     * @type {Number} changeFieldWage
     * @description 轉場時薪 - 平日 for薪資頁面
     * @member {Number}
     */
    this.changeFieldWage = null;
    /**
     * @type {Number} hourSalary
     * @description B碼時薪 for薪資頁面
     * @member {Number}
     */
    this.hourSalary = null;
    /**
     * @type {Number} hourSalaryG
     * @description G碼時薪 for薪資頁面
     * @member {Number}
     */
    this.hourSalaryG = null;
    /**
     * @type {Number} monthSalaryPerHour
     * @description 月薪制(時薪) for薪資頁面
     * @member {Number}
     */
    this.monthSalaryPerHour = null;
    /**
     * @type {Number} monthSalaryPerMonth
     * @description 月薪制(月薪) for薪資頁面
     * @member {Number}
     */
    this.monthSalaryPerMonth = null;
    /**
     * @type {Number} noTransitionWhenAddressIsTheSame
     * @description 排班的班與班的間隔為相同地址是否轉場 for薪資頁面
     * @member {Number}
     */
    this.noTransitionWhenAddressIsTheSame = null;
    /**
     * @type {Number} overAllowanceHour
     * @description 超時津貼起算工時 for薪資頁面
     * @member {Number}
     */
    this.overAllowanceHour = null;
    /**
     * @type {Number} overAllowanceSalary
     * @description 超時津貼時薪 for薪資頁面
     * @member {Number}
     */
    this.overAllowanceSalary = null;
    /**
     * @type {String} salaryNo
     * @description 薪資帳號 for薪資頁面
     * @member {String}
     */
    this.salaryNo = null;
    /**
     * @type {Number} salarySystem
     * @description 薪制 for薪資頁面(0:月薪制,1:時薪制)
     * @member {Number}
     */
    this.salarySystem = null;
    /**
     * @type {Boolean} senior
     * @description 資深員工 for薪資頁面
     * @member {Boolean}
     */
    this.senior = null;
    /**
     * @type {Array<Object>} shareSettings
     * @description 拆帳設定 for薪資頁面
     * @member {Array<Object>}
     */
    this.shareSettings = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = SalarySettingObject;
