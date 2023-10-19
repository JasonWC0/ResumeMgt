/**
 * FeaturePath: Common-Entity--機構薪水參數設定物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-setting-salary-object.js
 * Project: @erpv3/app-core
 * File Created: 2023-05-10 10:41:08 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class CustomSettingSalaryObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {boolean}
     * @description 轉場費計算，是否開啟「計次＋遠程加給」選項
     * @member {boolean}
     */
    this.calculateShareByCountWithDistanceAllowance = null;
    /**
     * @type {boolean}
     * @description 轉場費計算，是否開啟「公里數計算」選項
     * @member {boolean}
     */
    this.calculateShareByDistance = null;
    /**
     * @type {boolean}
     * @description 轉場費計算，是否開啟「交通時間計算」選項
     * @member {boolean}
     */
    this.calculateShareByTrafficTime = null;
    /**
     * @type {boolean}
     * @description 轉場費/分鐘數區分一般平日以及假日國定假日
     * @member {boolean}
     */
    this.holidayChangefieldTime = null;
    /**
     * @type {number}
     * @description 加班起算時數
     * @member {number}
     */
    this.overtimeStartHours = null;
    /**
     * @type {string}
     * @description 薪制(0:月薪制,1:時薪制)
     * @member {string}
     */
    this.salarySystem = null;
    /**
     * @type {boolean}
     * @description 單日轉場費，是否設定轉場費上限
     * @member {boolean}
     */
    this.shareUniformPrice = null;
    /**
     * @type {boolean}
     * @description 「轉場納入工時」及「排班班與班的間隔為相同地址不算轉場」設定顯示
     * @member {boolean}
     */
    this.showNoTransitionWhenAddressIsTheSame = null;
    /**
     * @type {boolean}
     * @description 轉場費計算，是否開啟「經緯度交通時間」選項
     * @member {boolean}
     */
    this.calculateShareByTrafficTimeByLongitudeAndLatitude = null;
    /**
     * @type {boolean}
     * @description 轉場費計算，是否開啟「經緯度直線距離」選項
     * @member {boolean}
     */
    this.calculateShareByDistanceByLongitudeAndLatitude = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = CustomSettingSalaryObject;
