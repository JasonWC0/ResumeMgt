/**
 * FeaturePath: Common-Entity--機構app參數設定物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: custom-setting-app-object.js
 * Project: @erpv3/app-core
 * File Created: 2023-05-10 10:41:08 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class CustomSettingAppObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {number} abnormalGpsDistance
     * @description 服務機構設定 – 超出案家定位範圍半徑（單位：公尺）
     * @member {number}
     */
    this.abnormalGpsDistance = null;
    /**
     * @type {number} advertisementMode
     * @description 機構的廣告模式
     * @member {number}
     */
    this.advertisementMode = null;
    /**
     * @type {boolean} fixedTimeNotEnoughRemind
     * @description 機構參數-是否當綁定時間的服務項目時數不足時，打卡跳出提醒
     * @member {boolean}
     */
    this.fixedTimeNotEnoughRemind = null;
    /**
     * @type {number} needEmployeeTemperatureWhenClockOutLastShift
     * @description 最後一個班下班時若當天居服員[體溫]未填寫則不允許下班
     * @member {number}
     */
    this.needEmployeeTemperatureWhenClockOutLastShift = null;
    /**
     * @type {number} needEmployeeToccWhenClockOutLastShift
     * @description 最後一個班下班時若當天居服員[TOCC]未填寫則不允許下班
     * @member {number}
     */
    this.needEmployeeToccWhenClockOutLastShift = null;
    /**
     * @type {number} showLastTemperatureOfTheDay
     * @description 家屬APP個案體溫，顯示最新一筆體溫或當日最後一筆
     * @member {number}
     */
    this.showLastTemperatureOfTheDay = null;
    /**
     * @type {boolean} switchAccountForHomeServiceApp
     * @description 是否開啟居服APP切換帳號功能
     * @member {boolean}
     */
    this.switchAccountForHomeServiceApp = null;
    /**
     * @type {number} timeIntervalOfAdOnApp
     * @description 是否使用APP廣告
     * @member {number}
     */
    this.timeIntervalOfAdOnApp = null;
    /**
     * @type {boolean} useAdOnApp
     * @description 是否使用APP廣告
     * @member {boolean}
     */
    this.useAdOnApp = null;
    /**
     * @type {boolean} mainPageDisplayPunchRecord
     * @description 顯示居服員當月服務時間月結表 (true：居服員App可看自己最近三個月的打卡記錄, false：居服員App不可看自己最近三個月的打卡記錄)
     * @member {boolean}
     */
    this.mainPageDisplayPunchRecord = null;
    /**
     * @type {boolean} mainPageDisplayServiceDetail
     * @description 顯示居服員當月服務項目細項 (true：居服員App可看自己最近三個月的服務次數統計, false：居服員App不可看自己最近三個月的服務次數統計)
     * @member {boolean}
     */
    this.mainPageDisplayServiceDetail = null;
    /**
     * @type {boolean} mainPageDisplayServiceUnit
     * @description 當月服務累積時間顯示單位 (true：單位為小時取到小數點後二位(xx.xx小時), false：單位為小時與分鐘(xx小時xx分))
     * @member {boolean}
     */
    this.mainPageDisplayServiceUnit = null;
    /**
     * @type {boolean} shiftPageDisplayServiceItem
     * @description 在基本資料頁顯示「該班應服務的項目和次數」 (true：在個案基本資料頁顯示「該班應服務的項目和次數」, false：在個案基本資料頁不顯示「該班應服務的項目和次數」)
     * @member {boolean}
     */
    this.shiftPageDisplayServiceItem = null;
    /**
     * @type {boolean} shiftPageAutoSubmitServiceRecord
     * @description  抵達、離開，自動送出服務紀錄 (true：抵達 > 離開，自動送出服務紀錄。必須同時將「3.顯示服務(補助)頁面」、「4.顯示服務(自費)頁面」設為false, false：抵達 > 送出服務紀錄 > 離開。必須同時將「3.顯示服務(補助)頁面」、「4.顯示服務(自費)頁面」設為true)
     * @member {boolean}
     */
    this.shiftPageAutoSubmitServiceRecord = null;
    /**
     * @type {boolean} shiftPageDisplayAllowance
     * @description 顯示服務(補助)頁面 (true：打卡時，顯示「服務(補助)」分頁。必須同時將「2. 抵達、離開，自動送出服務紀錄」設為false, false：：打卡時，不顯示「服務(補助)」分頁。必須同時將「2. 抵達、離開，自動送出服務紀錄」設為true)
     * @member {boolean}
     */
    this.shiftPageDisplayAllowance = null;
    /**
     * @type {boolean} shiftPageDisplaySelfPay
     * @description 顯示服務(自費)頁面 (true：打卡時，顯示「服務(自費)」分頁。必須同時將「2. 抵達、離開，自動送出服務紀錄」設為false, false：：打卡時，不顯示「服務(自費)」分頁。必須同時將「2. 抵達、離開，自動送出服務紀錄」設為true)
     * @member {boolean}
     */
    this.shiftPageDisplaySelfPay = null;
    /**
     * @type {string} shiftPageLimitClockInTime
     * @description 限制上班打卡時間 (-1：表示當日皆可打卡, 其他數字：限制只能在表定時間前後X分鐘上班)
     * @member {string}
     */
    this.shiftPageLimitClockInTime = null;
    /**
     * @type {boolean} shiftPageAlertServiceHourInsufficient
     * @description 離開打卡，若時數不足，多一道警告視窗 (true：打卡離開時，若服務時數 < (排班時數 - 時數不足彈性時間)，警告居服員時數不足, false：無以上機制)
     * @member {boolean}
     */
    this.shiftPageAlertServiceHourInsufficient = null;
    /**
     * @type {boolean} shiftPageClockOutForget
     * @description 打卡忘簽退機制 (true：前一個班忘刷退時（上班有打卡，下班忘記打卡），居服員已經到下一個班打卡上班，即不允許前一個班按“離開”, false：無以上機制)
     * @member {boolean}
     */
    this.shiftPageClockOutForget = null;
    /**
     * @type {boolean} shiftPageCancelShift
     * @description 案主請假功能 (true：居服員可幫案主和自己請假, false：居服員僅能幫自己請假)
     * @member {boolean}
     */
    this.shiftPageCancelShift = null;
    /**
     * @type {boolean} shiftPageRemindServieCountFull
     * @description 該班有服務次數已滿，按抵達時提醒居服員 (true：該班有服務次數已滿，按抵達時提醒居服員, false：無以上功能)
     * @member {boolean}
     */
    this.shiftPageRemindServieCountFull = null;
    /**
     * @type {string} shiftPageLimitDistance
     * @description 打卡距離限制 (-1：無距離限制, 其他數字：距離個案家X公尺內才允許打卡)
     * @member {string}
     */
    this.shiftPageLimitDistance = null;
    /**
     * @type {boolean} shiftPageSupportQRCode
     * @description 支援二維條碼打卡(App端) (true：支援二維條碼打卡(App端), false：無以上功能)
     * @member {boolean}
     */
    this.shiftPageSupportQRCode = null;
    /**
     * @type {boolean} shiftPageSupportSyncException
     * @description 班表同步異常機制 (true：有班表同步異常機制, false：無班表同步異常機制(不建議))
     * @member {boolean}
     */
    this.shiftPageSupportSyncException = null;
    /**
     * @type {boolean} shiftPageEnableEditServiceRecordOfDay
     * @description 居服員可修改當日的服務紀錄 (true：居服員可修改當日的服務紀錄, false：居服員不可修改當日的服務紀錄)
     * @member {boolean}
     */
    this.shiftPageEnableEditServiceRecordOfDay = null;
    /**
     * @type {string} shiftPageRingtoneRemind
     * @description 下班鈴聲提醒 (-1：不啟用下班鈴聲提醒, 其他數字：App已抵達的班，於班表結束時間前X分鐘有響鈴通知)
     * @member {string}
     */
    this.shiftPageRingtoneRemind = null;
    /**
     * @type {boolean} shiftPageAbsenceChargeFullCost
     * @description 服務未遇，收取當日排班的所有項目費用 (true：服務未遇，收取當日排班的所有項目費用, false：服務未遇，收取最便宜一項的費用，若該項單價高於500元則不收費)
     * @member {boolean}
     */
    this.shiftPageAbsenceChargeFullCost = null;
    /**
     * @type {boolean} shiftPageItemCountDefaultIsBlank
     * @description 服務(補助)、服務(自費)，項目次數預設空白 (true：項目次數預設空白, false：項目次數預設為排班次數)
     * @member {boolean}
     */
    this.shiftPageItemCountDefaultIsBlank = null;
    /**
     * @type {boolean} shiftPageAutoSubmitItemCount
     * @description 抵達、離開，未送出服務紀錄時，自動送出排班項目次數 (true：未送出服務紀錄時，自動送出排班項目次數, false：未送出服務紀錄時，自動送出排班項目次數為0)
     * @member {boolean}
     */
    this.shiftPageAutoSubmitItemCount = null;
    /**
     * @type {boolean} shiftPageTemporaryNeedItems
     * @description 顯示臨時需要項目/不顯示臨時需要項目 (true：顯示臨時需要項目, false：不顯示臨時需要項目)
     * @member {boolean}
     */
    this.shiftPageTemporaryNeedItems = null;
    /**
     * @type {string} shiftPageRemindWorkRingtone
     * @description 上班鈴聲提醒 (-1：不啟用上班鈴聲提醒, 其他數字：App已抵達的班，於班表開始時間前X分鐘有響鈴通知)
     * @member {string}
     */
    this.shiftPageRemindWorkRingtone = null;
    /**
     * @type {boolean} shiftPageMapCheck
     * @description 上下班打卡跳轉地圖頁面確認 (true：開啟跳轉, false：關閉跳轉)
     * @member {boolean}
     */
    this.shiftPageMapCheck = null;
    /**
     * @type {boolean} shiftPageMapDrag
     * @description 地圖確認頁面可拖拉地圖 (true：開啟拖拉, false：關閉拖拉)
     * @member {boolean}
     */
    this.shiftPageMapDrag = null;
    /**
     * @type {boolean} shiftPageAutoTransferToSelfPay
     * @description 服務次數在剩餘額度不足時，機構是否允許自動將補助項登打為自費項。 (true：自動轉自費, false：不自動轉自費)
     * @member {boolean}
     */
    this.shiftPageAutoTransferToSelfPay = null;
    /**
     * @type {boolean} shiftPageUseEpidemicPreventionEdition
     * @description 是否使用防疫版的APP介面 (true：使用, false：不使用)
     * @member {boolean}
     */
    this.shiftPageUseEpidemicPreventionEdition = null;
    /**
     * @type {string} shiftPageOperateRestriction
     * @description 服務頁面操作限制 (0：可調整順序、可修改次數、可修改時長、可新增項目。, 1：可調整順序、可修改次數、不可修改時長、可新增項目。（預設）, 2：可調整順序、不可修改次數、不可修改時長、不可新增項目。, 須同時依照下列設定才有該頁面可操作, 「2. 抵達、離開，自動送出服務紀錄」設為false。, 「3.顯示服務(補助)頁面」設為true。, 「4.顯示服務(自費)頁面」設為true。)
     * @member {string}
     */
    this.shiftPageOperateRestriction = null;
    /**
     * @type {string} shiftPageLimitClockOutTime
     * @description 限制下班打卡時間 (-1：表示當日皆可打卡, 其他數字：限制只能在表定時間前後X分鐘內下班)
     * @member {string}
     */
    this.shiftPageLimitClockOutTime = null;
    /**
     * @type {boolean} shiftPageLimitPreviousShiftNotClockOut
     * @description 上一個班未打卡下班，則限制第二班無法打卡上班 (true：限制, false：不限制)
     * @member {boolean}
     */
    this.shiftPageLimitPreviousShiftNotClockOut = null;
    /**
     * @type {boolean} shiftPageLimitClockOutTimeNeedAfterShiftStartTime
     * @description 限制下班打卡時間只能在表定時間後 (true：限制, false：不限制, 此項開啟只能在表定時間後下班打卡, 若此項為true且26.限制下班打卡時間有設定時間, 則只能在表定時間後與第26項設定的時間內下班)
     * @member {boolean}
     */
    this.shiftPageLimitClockOutTimeNeedAfterShiftStartTime = null;
    /**
     * @type {boolean} casePageDisplayCasePlan
     * @description 顯示個案列表 > 個案 > 照顧計畫 (true：顯示個案列表 > 個案 > 照顧計畫, false：不顯示)
     * @member {boolean}
     */
    this.casePageDisplayCasePlan = null;
    /**
     * @type {boolean} casePageDisplayContactInfo
     * @description 顯示案家緊急連絡人名和手機號碼 (true：顯示案主緊急聯絡人與電話, false：不顯示)
     * @member {boolean}
     */
    this.casePageDisplayContactInfo = null;
    /**
     * @type {boolean} casePageDisplayOfficePhone
     * @description 督導員的電話顯示改為用公司電話 (true：督導員的電話顯示改為用公司電話, false：督導員的電話顯示督導員的電話)
     * @member {boolean}
     */
    this.casePageDisplayOfficePhone = null;
    /**
     * @type {boolean} casePageDisplayServiceRecord
     * @description 顯示個案列表 > 個案 > 服務紀錄 (true：顯示個案列表 > 個案 > 服務紀錄。最近三個月的服務紀錄, false：不顯示)
     * @member {boolean}
     */
    this.casePageDisplayServiceRecord = null;
    /**
     * @type {boolean} casePageDisplayStatisticsOfServiceTimes
     * @description 顯示個案列表 > 個案 > 補助、自費月結表 (true：顯示個案列表 > 個案 > 補助、自費月結表。最近三個月的服務次數統計, false：不顯示)
     * @member {boolean}
     */
    this.casePageDisplayStatisticsOfServiceTimes = null;
    /**
     * @type {boolean} casePageDisplayCasePhone
     * @description 顯示個案電話 (true：顯示個案電話, false：不顯示)
     * @member {boolean}
     */
    this.casePageDisplayCasePhone = null;
    /**
     * @type {boolean} casePageDispayBirthDate
     * @description 不顯示生日 (true：不顯示生日, false：顯示)
     * @member {boolean}
     */
    this.casePageDispayBirthDate = null;
    /**
     * @type {boolean} casePageDispayCaseStatus
     * @description 不顯示個案服務狀態 (true：不顯示個案服務狀態, false：顯示)
     * @member {boolean}
     */
    this.casePageDispayCaseStatus = null;
    /**
     * @type {boolean} casePageDispayCaseCode
     * @description 顯示個案案號 (true：顯示個案案號, false：不顯示)
     * @member {boolean}
     */
    this.casePageDispayCaseCode = null;
    /**
     * @type {boolean} casePageDispayBodySituation
     * @description 不顯示個案身障類別 (true：不顯示個案身障類別, false：顯示)
     * @member {boolean}
     */
    this.casePageDispayBodySituation = null;
    /**
     * @type {boolean} vitalSignPageEnableDeleteRecord
     * @description 允許刪除生理量測數據 ("true：允許, false：不允 (家屬APP是否顯示個案額度)
     * @member {boolean}
     */
    this.vitalSignPageEnableDeleteRecord = null;
    /**
     * @type {boolean} supportMultiMeasureCheckInCheckOut
     * @description 支援使用多次生理量測簽到簽退
     * @member {boolean}
     */
    this.supportMultiMeasureCheckInCheckOut = null;
    /**
     * @type {boolean} supportAppEmployeeLeave
     * @description 是否支援員工使用APP請假
     * @member {boolean}
     */
    this.supportAppEmployeeLeave = null;
    /**
     * @type {boolean} monthlyShiftTimeCountByServiceTime
     * @description 是否居服App主頁當月服務累積時間以"服務項目時間"計算
     * @member {boolean}
     */
    this.monthlyShiftTimeCountByServiceTime = null;
    /**
     * @type {boolean} shiftListDisplayMonths
     * @description 居服App最多可往前看N個月前的班表
     * @member {boolean}
     */
    this.shiftListDisplayMonths = null;
    /**
     * @type {boolean} uploadPhotoWhenClockOut
     * @description 居服員下班打卡時才能上傳照片
     * @member {boolean}
     */
    this.uploadPhotoWhenClockOut = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = CustomSettingAppObject;
