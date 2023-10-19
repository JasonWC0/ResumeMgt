/**
 * FeaturePath: Common-Entity--機構排班參數設定物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-setting-shift-object.js
 * Project: @erpv3/app-core
 * File Created: 2023-05-10 10:41:08 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class CustomSettingShiftObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {number}
     * @description 案主不在-是否要給時間(default:30分鐘)
     * @member {number}
     */
    this.absencePayMinutes = null;
    /**
     * @type {number}
     * @description 日照機構員工上下班打卡範圍半徑(公尺)
     * @member {number}
     */
    this.DCEmployeeCheckInDistance = null;
    /**
     * @type {boolean}
     * @description 是否關閉日照舊版服務紀錄編輯功能(不能編輯只能查詢)
     * @member {boolean}
     */
    this.disableDayCareEditOldServiceRecord = null;
    /**
     * @type {boolean}
     * @description 服務機構設定 – 顯示定位異常標註
     * @member {boolean}
     */
    this.displayAbnormalGpsTag = null;
    /**
     * @type {boolean}
     * @description 排班時間是否以五分鐘為單位
     * @member {boolean}
     */
    this.fiveMinuteUnit = null;
    /**
     * @type {number}
     * @description 居服員下班時間基準 (小時)
     * @member {number}
     */
    this.needEmployeeTemperatureWhenClockOutLastShift = null;
    /**
     * @type {number}
     * @description 居服員下班時間基準 (分鐘)
     * @member {number}
     */
    this.needEmployeeToccWhenClockOutLastShift = null;
    /**
     * @type {number}
     * @description 居服員上班時間基準 (小時)
     * @member {number}
     */
    this.goToWorkHour = null;
    /**
     * @type {boolean}
     * @description 居服員上班時間基準 (分鐘)
     * @member {boolean}
     */
    this.goToWorkMin = null;
    /**
     * @type {boolean}
     * @description 居服-居服員請假審核/取消休假結果是否寄送簡訊通知
     * @member {boolean}
     */
    this.hcLeaveResultSendSMS = null;
    /**
     * @type {boolean}
     * @description 居服班表(總班表、個案班表、員工班表)是否預設顯示AA碼
     * @member {boolean}
     */
    this.hcShiftShowAA = null;
    /**
     * @type {number}
     * @description 空班間隔時間最小值 (小於此值則隱藏空班間隔時間)
     * @member {number}
     */
    this.idletimeBuffer = null;
    /**
     * @type {boolean}
     * @description 是否開啟午休打卡
     * @member {boolean}
     */
    this.needPunchLunchHourRecord = null;
    /**
     * @type {boolean}
     * @description 提醒排班使用額度即將超額
     * @member {boolean}
     */
    this.noticeOverAllowanceQuota = null;
    /**
     * @type {number}
     * @description 排班使用額度超過給付額度的提醒門檻％
     * @member {number}
     */
    this.overAllowancePercentage = null;
    /**
     * @type {boolean}
     * @description 智慧派遣時是否列出其他督導的居服員(default:false)
     * @member {boolean}
     */
    this.recommendOther = null;
    /**
     * @type {boolean}
     * @description 新增紀錄是否參考照顧計畫額度
     * @member {boolean}
     */
    this.refPlan = null;
    /**
     * @type {number}
     * @description 服務項目-子項目所需時間的bufferTime
     * @member {number}
     */
    this.serviceSubItemBufferTime = null;
    /**
     * @type {number}
     * @description 排班/服務紀錄筆筆切每筆間距增加N分鐘
     * @member {number}
     */
    this.serviceTimeSeparateOffset = null;
    /**
     * @type {number}
     * @description 遲到緩衝時間
     * @member {number}
     */
    this.shiftLateBufferTime = null;
    /**
     * @type {number}
     * @description 時數不足緩衝時間
     * @member {number}
     */
    this.shiftLeakBufferTime = null;
    /**
     * @type {boolean}
     * @description 員工本月已排定工時，總班表是否顯示員工本月已排定工時
     * @member {boolean}
     */
    this.showEmployeesHours = null;
    /**
     * @type {boolean}
     * @description 是否顯示超時狀態
     * @member {boolean}
     */
    this.showOverWorkHour = null;
    /**
     * @type {number}
     * @description 督導檢視與編輯班表權限(全部個案:0,督導個案:1)
     * @member {number}
     */
    this.supervisorAuthorityLimit = null;
    /**
     * @type {boolean}
     * @description 督導可編輯開關
     * @member {boolean}
     */
    this.supervisorEditable = null;
    /**
     * @type {boolean}
     * @description 是否支援服務C項目
     * @member {boolean}
     */
    this.supportC = null;
    /**
     * @type {boolean}
     * @description 員工自主排班
     * @member {boolean}
     */
    this.supportEmployeeManagerShift = null;
    /**
     * @type {boolean}
     * @description 是否支援服務OT項目
     * @member {boolean}
     */
    this.supportOT = null;
    /**
     * @type {boolean}
     * @description 是否支援QRCode打卡
     * @member {boolean}
     */
    this.supportQRCode = null;
    /**
     * @type {string}
     * @description 非計劃性排班
     * @member {string}
     */
    this.unPlan = null;
    /**
     * @type {boolean}
     * @description 是否使用交通車服務時間設定
     * @member {boolean}
     */
    this.useShuttleCarServiceTimeSetting = null;
    /**
     * @type {boolean}
     * @description 日照班表(總班表、個案班表)是否預設顯示AA碼
     * @member {boolean}
     */
    this.dcShiftShowAA = null;
    /**
     * @type {boolean}
     * @description 居服班表(總班表、個案班表)是否開啟可依服務時間顯示功能
     * @member {boolean}
     */
    this.hcHasShowServiceTimeInShiftFeature = null;
    /**
     * @type {number}
     * @description 在打卡頁面可以補登服務紀錄備註的天數
     * @member {number}
     */
    this.editServiceRecordMemoOnClockinPage = null;
    /**
     * @type {boolean}
     * @description 居服總班表是否可顯示最多200個居服員的班表
     * @member {boolean}
     */
    this.shiftList200DataPerPage = null;
    /**
     * @type {boolean}
     * @description 個案班表，是否開啟「服務項目打卡時間重疊提示」選項
     * @member {boolean}
     */
    this.isEnableHighlightTimeOverlapInSameMinute = null;
    /**
     * @type {boolean}
     * @description 居服排班延長工時提醒通知
     * @member {boolean}
     */
    this.shiftOvertimeNotify = null;
    /**
     * @type {number}
     * @description 時數不足緩衝時間
     * @member {number}
     */
    this.shiftLeakBufferTimeDc = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = CustomSettingShiftObject;
