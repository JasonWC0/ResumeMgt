/**
 * FeaturePath: Common-Model--機構
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: company.js
 * Project: @erpv3/app-core
 * File Created: 2022-02-09 03:05:05 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { SchemaTypes, Schema } = require('mongoose');
const { BaseSchema } = require('@erpv3/app-common/custom-models');
const { modelCodes, cityCodes, serviceItemBA02UnitCodes } = require('../../domain');
const { PlaceSchema, FileSchema } = require('./common-schema');

const _baseBankSchema = new Schema({
  _id: false,
  // 銀行名稱
  name: {
    type: String,
    trim: true,
  },
  // 分行名稱
  branch: {
    type: String,
    trim: true,
  },
  // 帳戶名稱
  account: {
    type: String,
    trim: true,
  },
  // 帳戶號碼
  number: {
    type: String,
    trim: true,
  },
});
const _baseCCodeTemplateSettingSchema = new Schema({
  // 復能目標
  revivalGoal: {
    type: String,
    trim: true,
  },
  // 復能目標達成情形
  revivalAccomplish: {
    type: String,
    trim: true,
  },
  // 指導對象
  revivalTarget: {
    type: String,
    trim: true,
  },
  // 服務內容
  revivalContent: {
    type: String,
    trim: true,
  },
  // 指導建議摘要
  revivalSummary: {
    type: String,
    trim: true,
  },
});
const _schema = new BaseSchema(
  {
    // 總公司Id
    corpId: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: `${modelCodes.CORPORATION}`,
    },
    // 公司全名
    fullName: {
      type: String,
      trim: true,
      required: true,
    },
    // 公司短名
    shortName: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    // 公司顯示名
    displayName: {
      type: String,
      trim: true,
    },
    // 合約上公司全名(內部，機構不可編輯)
    contractFullName: {
      type: String,
      trim: true,
    },
    // 合約上公司短名(內部，機構不可編輯)
    contractShortName: {
      type: String,
      trim: true,
    },
    // 流水編號
    serialNumber: {
      type: String,
      trim: true,
    },
    // 公司簡碼
    code: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    // 類型: 0:總公司 1:子公司
    type: {
      type: Number,
      required: true,
      enum: [0, 1],
    },
    // 服務列表 companyServiceCodes
    service: {
      type: Array,
    },
    // 服務類型Id (TODO: remove)
    serviceGroupId: {
      type: SchemaTypes.ObjectId,
      ref: `${modelCodes.SERVICEGROUP}`,
    },
    // 城市簡碼
    cityCode: {
      type: String,
      enum: Object.values(cityCodes),
      default: null,
    },
    // 機構編號(政府單位)
    govtCode: {
      type: String,
      trim: true,
    },
    // 統一編碼
    taxId: {
      type: String,
      trim: true,
    },
    // 許可文號
    licenseNumber: {
      type: String,
      trim: true,
    },
    // MarCom代碼
    marcom: {
      type: String,
      trim: true,
    },
    // 合約
    contract: {
      type: String,
    },
    // 合約起始日
    startDate: {
      type: Date,
    },
    // 合約到期日
    endDate: {
      type: Date,
    },
    // 公司地址
    registerPlace: {
      type: PlaceSchema,
    },
    // 公司電話
    phone: {
      type: String,
      trim: true,
    },
    // 公司傳真
    fax: {
      type: String,
      trim: true,
    },
    // 匯款帳戶
    bankAccount: {
      // 銀行帳戶Schema
      type: new Schema(_baseBankSchema),
    },
    // 匯款帳戶 2nd
    bankAccount2nd: {
      // 銀行帳戶Schema
      type: new Schema(_baseBankSchema),
    },
    // 角色列表
    roles: {
      type: Array,
    },
    // 地區
    region: {
      type: String,
      trim: true,
    },
    // 組織圖
    organizationalChart: {
      type: FileSchema,
    },
    // 機構參數設定 (仁寶管理)
    systemSetting: {
      // 是否進階薪資設定月薪制員工職別
      isAdvancedSalaryMthEE: {
        type: Boolean,
        default: false,
      },
      // 服務項目BA02的計算單位
      serviceItemBA02Unit: {
        type: Number,
        enum: Object.values(serviceItemBA02UnitCodes),
        default: serviceItemBA02UnitCodes.one,
      },
      // 支審系統-服務單位代碼
      feeApplyOrgNo: {
        type: String,
        trim: true,
      },
    },
    // 機構服務進階設定
    institutionSetting: {
      // 員工分類
      employeeCategory: {
        type: Array,
      },
      // 進階薪資設定
      advancedSalary: {
        // 月薪制員工職別1 - 名稱
        mthEEOfficialRankName1: {
          type: String,
          trim: true,
        },
        // 月薪制員工職別2 - 名稱
        mthEEOfficialRankName2: {
          type: String,
          trim: true,
        },
      },
      // 居家式排班規則
      HCShiftScheduleRules: {
        // 起始時間
        startTime: {
          type: String,
          trim: true,
        },
        // 結束時間
        endTime: {
          type: String,
          trim: true,
        },
        // 空班間隔最小值(分鐘)
        minInternal: {
          type: Number,
        },
      },
      // 住宿式排班規則
      RCShiftScheduleRules: {
        // 禁止排班休息時數低於時數
        forbiddenLessHours: {
          type: Number,
        },
        // 警告：排班休息時數大於時數
        warningOverHours: {
          type: Number,
        },
        // 警告：排班休息時數低於時數
        warningLessHours: {
          type: Number,
        },
      },
      // 社區式自動報到
      DCAutoPunch: {
        // 交通車抵達日照中心時
        onShuttleArrived: {
          type: Boolean,
        },
        // 進行生理量測時
        onTempMeasured: {
          type: Boolean,
        },
        // 生理量測，使用預設排班時間完成交通車報到
        useShiftScheduleTime: {
          type: Boolean,
        },
        // 使用APP報到
        useApp: {
          type: Boolean,
        },
        // APP報到，使用預設排班時間完成交通車報到
        useShiftScheduleTimeForApp: {
          type: Boolean,
        },
        // 多次生理量測報到簽退
        batchSignInAndSignOutTempMeasure: {
          type: Boolean,
        },
        // 連動BB碼與交通車起迄時間
        linkingUpBBCodeTime: {
          type: Boolean,
        },
      },
      // 社區式服務時間設定
      DCServiceTime: {
        // 排班B碼區分交通車上下午班次
        shiftScheduleBCode: {
          type: Boolean,
        },
        // 全日服務起始時間
        fullDayStartTime: {
          type: String,
          trim: true,
        },
        // 全日服務結束時間
        fullDayEndTime: {
          type: String,
          trim: true,
        },
        // 全日服務交通車時間 (分鐘)
        fullDayShuttleTime: {
          type: Number,
        },
        // 上半日服務起始時間
        beforeNoonStartTime: {
          type: String,
          trim: true,
        },
        // 上半日服務結束時間
        beforeNoonEndTime: {
          type: String,
          trim: true,
        },
        // 上半日服務交通車時間 (分鐘)
        beforeNoonShuttleTime: {
          type: Number,
        },
        // 下半日服務起始時間
        afterNoonStartTime: {
          type: String,
          trim: true,
        },
        // 下半日服務結束時間
        afterNoonEndTime: {
          type: String,
          trim: true,
        },
        // 下半日服務交通車時間 (分鐘)
        afterNoonShuttleTime: {
          type: Number,
        },
        // 社區式晚餐起始時間
        communityDinnerStartTime: {
          type: String,
          trim: true,
        },
        // 社區式晚餐結束時間
        communityDinnerEndTime: {
          type: String,
          trim: true,
        },
        // 社區式協助沐浴時間 (分鐘)
        communityAssistBathTime: {
          type: Number,
        },
      },
      // 居家式中央服務記錄
      HCCentralServiceReport: {
        // 切割模式
        splitType: {
          type: Number,
        },
        // 起迄時間
        timeType: {
          type: Number,
        },
      },
      // 社區式中央服務紀錄
      DCCentralServiceReport: {
        // 切割模式
        splitType: {
          type: Number,
        },
      },
      // 居家式個案收費單
      HCCaseBill: {
        // 版本設定
        version: {
          type: Number,
        },
        // 項目時段顯示設定
        itemTimePeriodView: {
          type: Number,
        },
      },
      // 社區式個案收費單
      DCCaseBill: {
        // 版本設定
        version: {
          type: Number,
        },
      },
      // 收據編號規則
      caseReceipt: {
        // 收據前綴
        customText1: {
          type: String,
          trim: true,
        },
        // 收據後綴
        customText2: {
          type: String,
          trim: true,
        },
        // 收據序號
        serialNumber: {
          type: Number,
          default: 1,
        },
      },
      // 印章
      stamps: {
        // 機構單位
        institutionStamp: {
          type: Object,
        },
        // 負責人
        principalStamp: {
          type: Object,
        },
        // 會計
        accountingStamp: {
          type: Object,
        },
        // 經手人
        handlerStamp: {
          type: Object,
        },
      },
      // 登入限制閒置時間
      idealTime: {
        // 限制閒置時間(min.)
        limitMinutes: {
          type: Number,
        },
        // 自動登出前提醒(min.)
        alertMinute: {
          type: Number,
        },
      },
      // 月薪制預設打卡時間
      punchTime: {
        // 上班打卡時間
        punchIn: {
          type: String,
          default: '08:00',
        },
        // 下班打卡時間
        punchOut: {
          type: String,
          default: '17:00',
        },
        // 午休開始時間
        lunchBreakStart: {
          type: String,
          default: '12:00',
        },
        // 午休結束時間
        lunchBreakEnd: {
          type: String,
          default: '13:00',
        },
      },
    },
    // 電子發票設定
    eInvoiceSetting: {
      // 綠界設定
      ecPay: {
        // 特店編號Id
        merchantId: {
          type: String,
          trim: true,
        },
        // hashKey
        hashKey: {
          type: String,
          trim: true,
        },
        // hashIV
        hashIV: {
          type: String,
          trim: true,
        },
      },
    },
    // 選單/頁面功能設定
    pageAuth: {
      type: Object,
    },
    // 報表群/報表功能設定
    reportAuth: {
      type: Object,
    },
    // 是否導入v3
    importERPv3: {
      type: Boolean,
      default: false,
    },
    // 聯護系統帳號
    careManagementAccount: {
      type: String,
      trim: true,
    },
    // 聯護系統密碼
    careManagementPassword: {
      type: String,
      trim: true,
    },
    // C碼服務項目預設值
    cCodeTemplateSetting: {
      // IADLs復能、ADLs復能照護
      CA07: {
        type: new Schema(_baseCCodeTemplateSettingSchema),
      },
      // 個別化服務計畫（ISP）擬定與執行
      CA08: {
        type: new Schema(_baseCCodeTemplateSettingSchema),
      },
      // 營養照護
      CB01: {
        type: new Schema(_baseCCodeTemplateSettingSchema),
      },
      // 進食與吞嚥照護
      CB02: {
        type: new Schema(_baseCCodeTemplateSettingSchema),
      },
      // 困擾行為照護
      CB03: {
        type: new Schema(_baseCCodeTemplateSettingSchema),
      },
      // 臥床或長期活動受限照護
      CB04: {
        type: new Schema(_baseCCodeTemplateSettingSchema),
      },
      // 居家環境安全或無障礙空間規劃
      CC01: {
        type: new Schema(_baseCCodeTemplateSettingSchema),
      },
      // 居家護理訪視
      CD01: {
        type: new Schema(_baseCCodeTemplateSettingSchema),
      },
      // 居家護理指導與諮詢
      CD02__10711: {
        type: new Schema(_baseCCodeTemplateSettingSchema),
      },
    },
    // 機構參數設定
    customSetting: {
      // 機構-相關參數
      company: {
        // 是否隱藏服務時數薪資報表
        hideEmployeeSalary: {
          type: Boolean,
          default: false,
        },
        // 是否隱藏服務時數薪資報表
        hideSalaryReport: {
          type: Boolean,
          default: false,
        },
        // 是否為測試站點(使內部統計報表不統計此公司相關的資訊)
        isTest: {
          type: Boolean,
        },
        // 是否使用華仁客製版表單
        useWyForm: {
          type: Boolean,
          default: false,
        },
        // 日照給付額度分配到出勤紀錄的優先順序
        arrangePunchRecordAllowanceQuotaDC: {
          type: Number,
          default: 0,
        },
        // 機構參數-啟用機構儀表板
        enableCompanyDashboard: {
          type: Number,
          default: 0,
        },
        // 收據流水號
        receiptSerialNumber: {
          type: Number,
          default: -1,
        },
        // 支援聯護系統
        supportCareManagement: {
          type: Boolean,
          default: false,
        },
        // 支援群組管理
        supportGroupManager: {
          type: Boolean,
          default: false,
        },
        // 是否啟用居服儀表板
        supportHomeServiceDashboard: {
          type: Boolean,
          default: false,
        },
        // 是否使用線上客服功能
        useOnlineService: {
          type: Boolean,
          default: false,
        },
        // 是否開啟「專業照顧計畫」相關功能
        useProPlan: {
          type: Boolean,
          default: false,
        },
        // 是否開啟護理專業照顧計畫
        useRNProPlan: {
          type: Boolean,
        },
        // 是否開啟物理/職能專業照顧計畫
        usePTProPlan: {
          type: Boolean,
        },
        // 是否開啟營養專業照顧計畫
        useRDProPlan: {
          type: Boolean,
        },
        // 是否使用收據流水號(顯示於個案收據)
        useReceiptSerialNumber: {
          type: Boolean,
          default: true,
        },
        // 是否支援活動顯示照片
        customizeActivityShowImage: {
          type: Boolean,
          default: false,
        },
        // 是否顯示全部活動
        showAllActivityForCase: {
          type: Boolean,
          default: true,
        },
        // 是否開啟社工專業照顧計畫
        useSWProPlan: {
          type: Boolean,
        },
        // 表單簽名是否使用手寫電子簽名
        useSignaturePad: {
          type: Boolean,
        },
        // 車輛檢查表是否使用版本二(11-18題)
        vehicleFormV2: {
          type: Boolean,
        }
      },
      // APP-相關參數
      app: {
        // 服務機構設定 – 超出案家定位範圍半徑（單位：公尺）
        abnormalGpsDistance: {
          type: Number,
          default: 500,
        },
        // 機構的廣告模式
        advertisementMode: {
          type: Number,
          default: 0,
        },
        // 機構參數-是否當綁定時間的服務項目時數不足時，打卡跳出提醒
        fixedTimeNotEnoughRemind: {
          type: Boolean,
          default: false,
        },
        // 最後一個班下班時若當天居服員[體溫]未填寫則不允許下班
        needEmployeeTemperatureWhenClockOutLastShift: {
          type: Number,
          default: 0,
        },
        // 最後一個班下班時若當天居服員[TOCC]未填寫則不允許下班
        needEmployeeToccWhenClockOutLastShift: {
          type: Number,
          default: 0,
        },
        // 家屬APP個案體溫，顯示最新一筆體溫或當日最後一筆
        showLastTemperatureOfTheDay: {
          type: Number,
          default: false,
        },
        // 是否開啟居服APP切換帳號功能
        switchAccountForHomeServiceApp: {
          type: Boolean,
          default: false,
        },
        // 是否使用APP廣告
        timeIntervalOfAdOnApp: {
          type: Number,
          default: 0,
        },
        // 是否使用APP廣告
        useAdOnApp: {
          type: Boolean,
          default: false,
        },
        // 顯示居服員當月服務時間月結表 (true：居服員App可看自己最近三個月的打卡記錄, false：居服員App不可看自己最近三個月的打卡記錄)
        mainPageDisplayPunchRecord: {
          type: Boolean,
        },
        // 顯示居服員當月服務項目細項 (true：居服員App可看自己最近三個月的服務次數統計, false：居服員App不可看自己最近三個月的服務次數統計)
        mainPageDisplayServiceDetail: {
          type: Boolean,
        },
        // 當月服務累積時間顯示單位 (true：單位為小時取到小數點後二位(xx.xx小時), false：單位為小時與分鐘(xx小時xx分))
        mainPageDisplayServiceUnit: {
          type: Boolean,
        },
        // 在基本資料頁顯示「該班應服務的項目和次數」 (true：在個案基本資料頁顯示「該班應服務的項目和次數」, false：在個案基本資料頁不顯示「該班應服務的項目和次數」)
        shiftPageDisplayServiceItem: {
          type: Boolean,
        },
        //  抵達、離開，自動送出服務紀錄 (true：抵達 > 離開，自動送出服務紀錄。必須同時將「3.顯示服務(補助)頁面」、「4.顯示服務(自費)頁面」設為false, false：抵達 > 送出服務紀錄 > 離開。必須同時將「3.顯示服務(補助)頁面」、「4.顯示服務(自費)頁面」設為true)
        shiftPageAutoSubmitServiceRecord: {
          type: Boolean,
        },
        // 顯示服務(補助)頁面 (true：打卡時，顯示「服務(補助)」分頁。必須同時將「2. 抵達、離開，自動送出服務紀錄」設為false, false：：打卡時，不顯示「服務(補助)」分頁。必須同時將「2. 抵達、離開，自動送出服務紀錄」設為true)
        shiftPageDisplayAllowance: {
          type: Boolean,
        },
        // 顯示服務(自費)頁面 (true：打卡時，顯示「服務(自費)」分頁。必須同時將「2. 抵達、離開，自動送出服務紀錄」設為false, false：：打卡時，不顯示「服務(自費)」分頁。必須同時將「2. 抵達、離開，自動送出服務紀錄」設為true)
        shiftPageDisplaySelfPay: {
          type: Boolean,
        },
        // 限制上班打卡時間 (-1：表示當日皆可打卡, 其他數字：限制只能在表定時間前後X分鐘上班)
        shiftPageLimitClockInTime: {
          type: String,
          trim: true,
        },
        // 離開打卡，若時數不足，多一道警告視窗 (true：打卡離開時，若服務時數 < (排班時數 - 時數不足彈性時間)，警告居服員時數不足, false：無以上機制)
        shiftPageAlertServiceHourInsufficient: {
          type: Boolean,
        },
        // 打卡忘簽退機制 (true：前一個班忘刷退時（上班有打卡，下班忘記打卡），居服員已經到下一個班打卡上班，即不允許前一個班按“離開”, false：無以上機制)
        shiftPageClockOutForget: {
          type: Boolean,
        },
        // 案主請假功能 (true：居服員可幫案主和自己請假, false：居服員僅能幫自己請假)
        shiftPageCancelShift: {
          type: Boolean,
        },
        // 該班有服務次數已滿，按抵達時提醒居服員 (true：該班有服務次數已滿，按抵達時提醒居服員, false：無以上功能)
        shiftPageRemindServieCountFull: {
          type: Boolean,
        },
        // 打卡距離限制 (-1：無距離限制, 其他數字：距離個案家X公尺內才允許打卡)
        shiftPageLimitDistance: {
          type: String,
          trim: true,
        },
        // 支援二維條碼打卡(App端) (true：支援二維條碼打卡(App端), false：無以上功能)
        shiftPageSupportQRCode: {
          type: Boolean,
        },
        // 班表同步異常機制 (true：有班表同步異常機制, false：無班表同步異常機制(不建議))
        shiftPageSupportSyncException: {
          type: Boolean,
        },
        // 居服員可修改當日的服務紀錄 (true：居服員可修改當日的服務紀錄, false：居服員不可修改當日的服務紀錄)
        shiftPageEnableEditServiceRecordOfDay: {
          type: Boolean,
        },
        // 下班鈴聲提醒 (-1：不啟用下班鈴聲提醒, 其他數字：App已抵達的班，於班表結束時間前X分鐘有響鈴通知)
        shiftPageRingtoneRemind: {
          type: String,
          trim: true,
        },
        // 服務未遇，收取當日排班的所有項目費用 (true：服務未遇，收取當日排班的所有項目費用, false：服務未遇，收取最便宜一項的費用，若該項單價高於500元則不收費)
        shiftPageAbsenceChargeFullCost: {
          type: Boolean,
        },
        // 服務(補助)、服務(自費)，項目次數預設空白 (true：項目次數預設空白, false：項目次數預設為排班次數)
        shiftPageItemCountDefaultIsBlank: {
          type: Boolean,
        },
        // 抵達、離開，未送出服務紀錄時，自動送出排班項目次數 (true：未送出服務紀錄時，自動送出排班項目次數, false：未送出服務紀錄時，自動送出排班項目次數為0)
        shiftPageAutoSubmitItemCount: {
          type: Boolean,
        },
        // 顯示臨時需要項目/不顯示臨時需要項目 (true：顯示臨時需要項目, false：不顯示臨時需要項目)
        shiftPageTemporaryNeedItems: {
          type: Boolean,
        },
        // 上班鈴聲提醒 (-1：不啟用上班鈴聲提醒, 其他數字：App已抵達的班，於班表開始時間前X分鐘有響鈴通知)
        shiftPageRemindWorkRingtone: {
          type: String,
          trim: true,
        },
        // 上下班打卡跳轉地圖頁面確認 (true：開啟跳轉, false：關閉跳轉)
        shiftPageMapCheck: {
          type: Boolean,
        },
        // 地圖確認頁面可拖拉地圖 (true：開啟拖拉, false：關閉拖拉)
        shiftPageMapDrag: {
          type: Boolean,
        },
        // 服務次數在剩餘額度不足時，機構是否允許自動將補助項登打為自費項。 (true：自動轉自費, false：不自動轉自費)
        shiftPageAutoTransferToSelfPay: {
          type: Boolean,
        },
        // 是否使用防疫版的APP介面 (true：使用, false：不使用)
        shiftPageUseEpidemicPreventionEdition: {
          type: Boolean,
        },
        // 服務頁面操作限制 (0：可調整順序、可修改次數、可修改時長、可新增項目。, 1：可調整順序、可修改次數、不可修改時長、可新增項目。（預設）, 2：可調整順序、不可修改次數、不可修改時長、不可新增項目。, 須同時依照下列設定才有該頁面可操作, 「2. 抵達、離開，自動送出服務紀錄」設為false。, 「3.顯示服務(補助)頁面」設為true。, 「4.顯示服務(自費)頁面」設為true。)
        shiftPageOperateRestriction: {
          type: String,
          trim: true,
        },
        // 限制下班打卡時間 (-1：表示當日皆可打卡, 其他數字：限制只能在表定時間前後X分鐘內下班)
        shiftPageLimitClockOutTime: {
          type: String,
          trim: true,
        },
        // 上一個班未打卡下班，則限制第二班無法打卡上班 (true：限制, false：不限制)
        shiftPageLimitPreviousShiftNotClockOut: {
          type: Boolean,
        },
        // 限制下班打卡時間只能在表定時間後 (true：限制, false：不限制, 此項開啟只能在表定時間後下班打卡, 若此項為true且26.限制下班打卡時間有設定時間, 則只能在表定時間後與第26項設定的時間內下班)
        shiftPageLimitClockOutTimeNeedAfterShiftStartTime: {
          type: Boolean,
        },
        // 顯示個案列表 > 個案 > 照顧計畫 (true：顯示個案列表 > 個案 > 照顧計畫, false：不顯示)
        casePageDisplayCasePlan: {
          type: Boolean,
        },
        // 顯示案家緊急連絡人名和手機號碼 (true：顯示案主緊急聯絡人與電話, false：不顯示)
        casePageDisplayContactInfo: {
          type: Boolean,
        },
        // 督導員的電話顯示改為用公司電話 (true：督導員的電話顯示改為用公司電話, false：督導員的電話顯示督導員的電話)
        casePageDisplayOfficePhone: {
          type: Boolean,
        },
        // 顯示個案列表 > 個案 > 服務紀錄 (true：顯示個案列表 > 個案 > 服務紀錄。最近三個月的服務紀錄, false：不顯示)
        casePageDisplayServiceRecord: {
          type: Boolean,
        },
        // 顯示個案列表 > 個案 > 補助、自費月結表 (true：顯示個案列表 > 個案 > 補助、自費月結表。最近三個月的服務次數統計, false：不顯示)
        casePageDisplayStatisticsOfServiceTimes: {
          type: Boolean,
        },
        // 顯示個案電話 (true：顯示個案電話, false：不顯示)
        casePageDisplayCasePhone: {
          type: Boolean,
        },
        // 不顯示生日 (true：不顯示生日, false：顯示)
        casePageDispayBirthDate: {
          type: Boolean,
        },
        // 不顯示個案服務狀態 (true：不顯示個案服務狀態, false：顯示)
        casePageDispayCaseStatus: {
          type: Boolean,
        },
        // 顯示個案案號 (true：顯示個案案號, false：不顯示)
        casePageDispayCaseCode: {
          type: Boolean,
        },
        // 不顯示個案身障類別 (true：不顯示個案身障類別, false：顯示)
        casePageDispayBodySituation: {
          type: Boolean,
        },
        // 允許刪除生理量測數據 ("true：允許, false：不允 (家屬APP是否顯示個案額度)
        vitalSignPageEnableDeleteRecord: {
          type: Boolean,
        },
        // 支援使用多次生理量測簽到簽退
        supportMultiMeasureCheckInCheckOut: {
          type: Boolean,
        },
        // 是否支援員工使用APP請假
        supportAppEmployeeLeave: {
          type: Boolean,
        },
        // 是否居服App主頁當月服務累積時間以"服務項目時間"計算
        monthlyShiftTimeCountByServiceTime: {
          type: Boolean,
        },
        // 居服App最多可往前看N個月前的班表
        shiftListDisplayMonths: {
          type: Boolean,
        },
        // 居服員下班打卡時才能上傳照片
        uploadPhotoWhenClockOut: {
          type: Boolean,
        },
        // APP 是否顯示給付額度
        showBundledRatioSubsidy: {
          type: Boolean,
        },
        // 居服App照片幾天內可上傳
        uploadPhotoDays: {
          type: String
        }
      },
      // 個案-相關參數
      case: {
        // 日照個案是否要顯示表單區塊
        showFormMenu: {
          type: Boolean,
          default: false,
        },
        // 是否計算機構與個案居住地的交通距離，預設為不開啟
        supportCalculateWithCaseDistance: {
          type: Boolean,
          default: false,
        },
        // 顯示居服評鑑表單
        supportCaseEvaluation: {
          type: Boolean,
          default: false,
        },
        // 家屬Line-是否限制關帳後才能取得個案收據
        supportCaseReceiptAfterClose: {
          type: Boolean,
          default: false,
        },
        // 個案是否顯示福利別
        supportWelfare: {
          type: Boolean,
          default: false,
        },
        // 是否開啟日照個案頁面的日照評鑑表單功能
        useDaycaseAccreditationForm: {
          type: Boolean,
          default: false,
        },
        // 是否使用身障生活補助
        useDisabilityLivingAllowance: {
          type: Boolean,
          default: false,
        },
      },
      // 員工-相關參數
      employee: {
        // 專員篩選，只顯示該專員負責的個案/員工
        filterBySuhc: {
          type: Boolean,
          default: false,
        },
        // 預設督導是否顯示所屬個案
        supervisorShowBelong: {
          type: Boolean,
          default: false,
        },
        // 是否支援員工生理量測(此設定會連動至APP提示與頁面及WEB頁面)
        supportEmployeeVitalSignsRecord: {
          type: Boolean,
          default: false,
        },
        // 是否支援足跡功能(此設定會連動至APP頁面)
        supportFootprintRecord: {
          type: Boolean,
          default: false,
        },
        // 是否啟用居服員未填足跡紀錄提醒服務
        supportFootprintRemind: {
          type: Boolean,
          default: false,
        },
        // 是否開啟權限設定功能
        useRoleAuthoritySetting: {
          type: Boolean,
          default: false,
        },
        // 員工每周最大工時
        weekHours: {
          type: Number,
          default: 40,
        },
      },
      // 訊息-相關參數
      message: {
        // 是否支援家屬APP
        supportAppCustomer: {
          type: Boolean,
          default: true,
        },
        // 是否支援居服APP
        supportAppEmployee: {
          type: Boolean,
          default: true,
        },
        // 是否支援RN-APP
        supportAppRN: {
          type: Boolean,
          default: false,
        },
        // 家庭聯絡簿更動是否發送訊息通知(不包含親職溝通)
        contactBookSendNotify: {
          type: Boolean,
          default: true,
        },
      },
      // 報表-相關參數
      report: {
        // 日照個案收據僅顯示有服務紀錄
        caseReceiptDcOnlyShowService: {
          type: Boolean,
          default: false,
        },
        // 機構參數-個案收據機構資訊欄位是否需要加大
        caseReceiptEnlargeCompanyInfo: {
          type: Boolean,
          default: true,
        },
        // 機構參數-"個案收據/個案收費單"是否一律使用一般價
        caseReceiptUseGeneralPrice: {
          type: Boolean,
          default: true,
        },
        // 中央服務紀錄分割一個檔案的紀錄數量上限
        countUpperLimit: {
          type: Number,
          default: 3000,
        },
        // 個案收費單中是否包含個案收據
        customerReceipt: {
          type: Boolean,
          default: false,
        },
        // 在居服員紀錄表單中，是否顯示個案案號
        employeeServiceRecordShowCustomCode: {
          type: Boolean,
          default: false,
        },
        // 報表產生間隔時間(分鐘)
        reportCreateIntervalTime: {
          type: Number,
          default: 1,
        },
        // 服務顯示名稱(用於居服個案收據(公版)、居服個案收費單(標準版/簡易版))
        serviceDisplayName: {
          type: String,
          default: '',
        },
        // 顯示分析報表 -> 分析圖表
        showAnalysisChart: {
          type: Boolean,
        },
        // 個案收費單中是否顯示原價
        showOriginalPrice: {
          type: Boolean,
          default: false,
        },
        // 分析報表>居服>時薪制居服員特休時數表，期間服務工時是否含加班時數預設值(前端介面預設會帶入此設定值，但實際產生報表時還是以使用者選擇為主)
        employeeAnnualLeaveReportCountOvertime: {
          type: Boolean,
        }
      },
      // 薪資-相關參數
      salary: {
        // 轉場費計算，是否開啟「計次＋遠程加給」選項
        calculateShareByCountWithDistanceAllowance: {
          type: Boolean,
          default: false,
        },
        // 轉場費計算，是否開啟「公里數計算」選項
        calculateShareByDistance: {
          type: Boolean,
          default: false,
        },
        // 轉場費計算，是否開啟「交通時間計算」選項
        calculateShareByTrafficTime: {
          type: Boolean,
          default: false,
        },
        // 轉場費/分鐘數區分一般平日以及假日國定假日
        holidayChangefieldTime: {
          type: Boolean,
          default: false,
        },
        // 加班起算時數
        overtimeStartHours: {
          type: Number,
          default: 8,
        },
        // 薪制(0:月薪制,1:時薪制)
        salarySystem: {
          type: String,
          default: 1,
        },
        // 單日轉場費，是否設定轉場費上限
        shareUniformPrice: {
          type: Boolean,
          default: false,
        },
        // 「轉場納入工時」及「排班班與班的間隔為相同地址不算轉場」設定顯示
        showNoTransitionWhenAddressIsTheSame: {
          type: Boolean,
          default: false,
        },
        // 轉場費計算，是否開啟「經緯度交通時間」選項
        calculateShareByTrafficTimeByLongitudeAndLatitude: {
          type: Boolean,
          default: false,
        },
        // 轉場費計算，是否開啟「經緯度直線距離」選項
        calculateShareByDistanceByLongitudeAndLatitude: {
          type: Boolean,
          default: false,
        },
      },
      // 班表-相關參數
      shift: {
        // 案主不在-是否要給時間(default:30分鐘)
        absencePayMinutes: {
          type: Number,
          default: 30,
        },
        // 日照機構員工上下班打卡範圍半徑(公尺)
        DCEmployeeCheckInDistance: {
          type: Number,
          default: 0,
        },
        // 是否關閉日照舊版服務紀錄編輯功能(不能編輯只能查詢)
        disableDayCareEditOldServiceRecord: {
          type: Boolean,
          default: true,
        },
        // 服務機構設定 – 顯示定位異常標註
        displayAbnormalGpsTag: {
          type: Boolean,
          default: false,
        },
        // 排班時間是否以五分鐘為單位
        fiveMinuteUnit: {
          type: Boolean,
          default: false,
        },
        // 居服員下班時間基準 (小時)
        needEmployeeTemperatureWhenClockOutLastShift: {
          type: Number,
          default: 0,
        },
        // 居服員下班時間基準 (分鐘)
        needEmployeeToccWhenClockOutLastShift: {
          type: Number,
          default: 0,
        },
        // 居服員上班時間基準 (小時)
        goToWorkHour: {
          type: Number,
          default: 8,
        },
        // 居服員上班時間基準 (分鐘)
        goToWorkMin: {
          type: Number,
          default: 0,
        },
        // 居服-居服員請假審核/取消休假結果是否寄送簡訊通知
        hcLeaveResultSendSMS: {
          type: Boolean,
          default: true,
        },
        // 居服班表(總班表、個案班表、員工班表)是否預設顯示AA碼
        hcShiftShowAA: {
          type: Boolean,
          default: false,
        },
        // 空班間隔時間最小值 (小於此值則隱藏空班間隔時間)
        idletimeBuffer: {
          type: Number,
          default: 30,
        },
        // 是否開啟午休打卡
        needPunchLunchHourRecord: {
          type: Boolean,
          default: false,
        },
        // 提醒排班使用額度即將超額
        noticeOverAllowanceQuota: {
          type: Boolean,
          default: false,
        },
        // 排班使用額度超過給付額度的提醒門檻％
        overAllowancePercentage: {
          type: Number,
          default: 80,
        },
        // 智慧派遣時是否列出其他督導的居服員(default:false)
        recommendOther: {
          type: Boolean,
          default: false,
        },
        // 新增紀錄是否參考照顧計畫額度
        refPlan: {
          type: Boolean,
          default: false,
        },
        // 服務項目-子項目所需時間的bufferTime
        serviceSubItemBufferTime: {
          type: Number,
          default: 999,
        },
        // 排班/服務紀錄筆筆切每筆間距增加N分鐘
        serviceTimeSeparateOffset: {
          type: Number,
          default: 0,
        },
        // 遲到緩衝時間
        shiftLateBufferTime: {
          type: Number,
          default: 15,
        },
        // 時數不足緩衝時間
        shiftLeakBufferTime: {
          type: Number,
          default: 30,
        },
        // 員工本月已排定工時，總班表是否顯示員工本月已排定工時
        showEmployeesHours: {
          type: Boolean,
          default: false,
        },
        // 是否顯示超時狀態
        showOverWorkHour: {
          type: Boolean,
          default: false,
        },
        // 督導檢視與編輯班表權限(全部個案:0,督導個案:1)
        supervisorAuthorityLimit: {
          type: Number,
          default: 0,
        },
        // 督導可編輯開關
        supervisorEditable: {
          type: Boolean,
          default: true,
        },
        // 是否支援服務C項目
        supportC: {
          type: Boolean,
          default: false,
        },
        // 員工自主排班
        supportEmployeeManagerShift: {
          type: Boolean,
          default: false,
        },
        // 是否支援服務OT項目
        supportOT: {
          type: Boolean,
          default: false,
        },
        // 是否支援QRCode打卡
        supportQRCode: {
          type: Boolean,
          default: false,
        },
        // 非計劃性排班
        unPlan: {
          type: String,
          default: '0',
        },
        // 是否使用交通車服務時間設定
        useShuttleCarServiceTimeSetting: {
          type: Boolean,
          default: false,
        },
        // 日照班表(總班表、個案班表)是否預設顯示AA碼
        dcShiftShowAA: {
          type: Boolean,
          default: false,
        },
        // 居服班表(總班表、個案班表)是否開啟可依服務時間顯示功能
        hcHasShowServiceTimeInShiftFeature: {
          type: Boolean,
          default: false,
        },
        // 在打卡頁面可以補登服務紀錄備註的天數
        editServiceRecordMemoOnClockinPage: {
          type: Number,
          default: 1,
        },
        // 居服總班表是否可顯示最多200個居服員的班表
        shiftList200DataPerPage: {
          type: Boolean,
          default: false,
        },
        // 個案班表，是否開啟「服務項目打卡時間重疊提示」選項
        isEnableHighlightTimeOverlapInSameMinute: {
          type: Boolean,
          default: false,
        },
        // 居服排班延長工時提醒通知
        shiftOvertimeNotify: {
          type: Boolean,
        },
        // 時數不足緩衝時間
        shiftLeakBufferTimeDc: {
          type: Number,
        },
        // 排班時允許自行輸入額外轉場計算
        shiftCustomExtraTransitions: {
          type: Number,
        },
        // 單項服務紀錄備註
        serviceRecordItemMemo: {
          type: String,
        },
        // 服務項目-子項目時數不足提醒時間
        serviceSubItemWarnTime: {
          type: String,
        },
        // 日照午休開始時間基準
        lunchHourStartTime: {
          type: String,
        },
        // 日照午休結束時間基準
        lunchHourEndTime: {
          type: String,
        },
        // 日照系統是否啟用[刪除補助的服務項目時，檢查當月有無自費項目可轉補助，若有則更新之]功能
        useUpdateRecordsWhenDeleteAllowance: {
          type: Boolean,
        }
      },
      // TOCC-相關參數
      tocc: {
        // 是否統計未排班員工TOCC紀錄
        calculateUnShiftEmployeeTOCC: {
          type: Boolean,
        },
        // displayTOCCFillDate
        displayTOCCFillDate: {
          type: Boolean,
        },
        // 打下班卡時該班個案[TOCC]未填寫則不允許下班
        needShiftToccWhenClockOut: {
          type: Number,
        },
        // 是否支援TOCC評估表功能(此設定會連動至APP頁面)
        supportToccForm: {
          type: Boolean,
        },
      },
    },
    // 營養餐飲服務-費用設定
    otCodeCostSetting: {
      OT01: {
        // 費用
        cost: {
          type: Number,
        },
        // 低收部分負擔費用
        lowPay: {
          type: Number,
        },
        // 中收部分負擔費用
        middlePay: {
          type: Number,
        },
        // 一般戶部分負擔費用
        normalPay: {
          type: Number,
        },
      },
    },
    // 服務項目所需時間 (Ex: { "BA10-1" : 25 })
    serviceItemSuggestTime: {
      type: Object,
    },
    // 選單設定
    sidebar: [{
      type: String,
    }],
  },
  {
    versionKey: false,
    timestamps: true,
    collection: `${modelCodes.COMPANY.slice(0, -1)}ies`,
  }
);

module.exports = {
  modelName: modelCodes.COMPANY,
  schema: _schema,
};
