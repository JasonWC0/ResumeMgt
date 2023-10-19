/**
 * FeaturePath: Common-Entity--機構服務進階設定物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: company-institution-setting-object.js
 * Project: @erpv3/app-core
 * File Created: 2022-02-24 07:27:04 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models } = require('@erpv3/app-common');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { BaseBundle, CustomError } = require('@erpv3/app-common/custom-models');
const coreErrorCodes = require('../enums/error-codes');
const companyServiceCodes = require('../enums/company-service-codes');
const centralServiceSplitCodes = require('../enums/central-service-split-codes');
const centralServiceTimeCodes = require('../enums/central-service-time-codes.js');
const caseBillVersionCodes = require('../enums/case-bill-version-codes');
const caseBillTimeCodes = require('../enums/case-bill-time-codes');
const FileObject = require('./file-object');

class CompanyInstitutionSetting extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {array} employeeCategory
     * @description 員工分類
     * @member
     */
    this.employeeCategory = [];
    /**
     * @type {object} advancedSalary
     * @description 進階薪資設定
     * @member
     */
    this.advancedSalary = {
      /**
       * @type {string} mthEEOfficialRankName1
       * @description 月薪制員工職別1 - 名稱
       * @member
       */
      mthEEOfficialRankName1: '',
      /**
       * @type {string} mthEEOfficialRankName2
       * @description 月薪制員工職別2 - 名稱
       * @member
       */
      mthEEOfficialRankName2: '',
    };
    /**
     * @type {object} HCShiftScheduleRules
     * @description 居家式排班規則
     * @member
     */
    this.HCShiftScheduleRules = {
      /**
       * @type {string} startTime
       * @description 起始時間
       * @member
       */
      startTime: '',
      /**
       * @type {string} startTime
       * @description 結束時間
       * @member
       */
      endTime: '',
      /**
       * @type {number} startTime
       * @description 空班間隔最小值(分鐘)
       * @member
       */
      minInternal: null,
    };
    /**
     * @type {object} RCShiftScheduleRules
     * @description 住宿式排班規則
     * @member
     */
    this.RCShiftScheduleRules = {
      /**
       * @type {number} forbiddenLessHours
       * @description 禁止排班休息時數低於時數
       * @member
       */
      forbiddenLessHours: null,
      /**
       * @type {number} warningOverHours
       * @description 警告：排班休息時數大於時數
       * @member
       */
      warningOverHours: null,
      /**
       * @type {number} warningLessHours
       * @description 警告：排班休息時數低於時數
       * @member
       */
      warningLessHours: null,
    };
    /**
     * @type {object} DCAutoPunch
     * @description 社區式自動報到
     * @member
     */
    this.DCAutoPunch = {
      /**
       * @type {boolean} onShuttleArrived
       * @description 交通車抵達日照中心時
       * @member
       */
      onShuttleArrived: false,
      /**
       * @type {boolean} onTempMeasured
       * @description 進行生理量測時
       * @member
       */
      onTempMeasured: false,
      /**
       * @type {boolean} useShiftScheduleTime
       * @description 使用預設排班時間完成交通車報到
       * @member
       */
      useShiftScheduleTime: false,
      /**
       * @type {boolean} useApp
       * @description 使用APP報到
       * @member
       */
      useApp: false,
      /**
       * @type {boolean} useShiftScheduleTimeForApp
       * @description APP報到，使用預設排班時間完成交通車報到
       * @member
       */
      useShiftScheduleTimeForApp: false,
      /**
       * @type {boolean} batchSignInAndSignOutTempMeasure
       * @description 多次生理量測報到簽退
       * @member
       */
      batchSignInAndSignOutTempMeasure: false,
      /**
       * @type {boolean} linkingUpBBCodeTime
       * @description 連動BB碼與交通車起迄時間
       * @member
       */
      linkingUpBBCodeTime: false,
    };
    /**
     * @type {object} DCServiceTime
     * @description 社區式服務時間設定
     * @member
     */
    this.DCServiceTime = {
      /**
       * @type {boolean} shiftScheduleBCode
       * @description 排班B碼區分交通車上下午班次
       * @member
       */
      shiftScheduleBCode: false,
      /**
       * @type {string} shiftScheduleBCode
       * @description 全日服務起始時間
       * @member
       */
      fullDayStartTime: '',
      /**
       * @type {string} fullDayEndTime
       * @description 全日服務結束時間
       * @member
       */
      fullDayEndTime: '',
      /**
       * @type {number} fullDayShuttleTime
       * @description 全日服務交通車時間 (分鐘)
       * @member
       */
      fullDayShuttleTime: null,
      /**
       * @type {string} beforeNoonStartTime
       * @description 上半日服務起始時間
       * @member
       */
      beforeNoonStartTime: '',
      /**
       * @type {string} beforeNoonEndTime
       * @description 上半日服務結束時間
       * @member
       */
      beforeNoonEndTime: '',
      /**
       * @type {number} beforeNoonShuttleTime
       * @description 上半日服務交通車時間 (分鐘)
       * @member
       */
      beforeNoonShuttleTime: null,
      /**
       * @type {string} afterNoonStartTime
       * @description 下半日服務起始時間
       * @member
       */
      afterNoonStartTime: '',
      /**
       * @type {string} afterNoonEndTime
       * @description 下半日服務結束時間
       * @member
       */
      afterNoonEndTime: '',
      /**
       * @type {number} afterNoonShuttleTime
       * @description 下半日服務交通車時間 (分鐘)
       * @member
       */
      afterNoonShuttleTime: null,
      /**
       * @type {string} communityDinnerStartTime
       * @description 社區式晚餐起始時間
       * @member
       */
      communityDinnerStartTime: '',
      /**
       * @type {string} communityDinnerEndTime
       * @description 社區式晚餐結束時間
       * @member
       */
      communityDinnerEndTime: '',
      /**
       * @type {number} communityAssistBathTime
       * @description 社區式協助沐浴時間 (分鐘)
       * @member
       */
      communityAssistBathTime: null,
    };
    /**
     * @type {object} HCCentralServiceReport
     * @description 居家式中央服務記錄
     * @member
     */
    this.HCCentralServiceReport = {
      /**
       * @type {number} splitType
       * @description 切割模式
       * @member
       */
      splitType: null,
      /**
       * @type {number} timeType
       * @description 起迄時間
       * @member
       */
      timeType: null,
    };
    /**
     * @type {object} DCCentralServiceReport
     * @description 社區式中央服務紀錄
     * @member
     */
    this.DCCentralServiceReport = {
      /**
       * @type {number} splitType
       * @description 切割模式
       * @member
       */
      splitType: null,
    };
    /**
     * @type {object} HCCaseBill
     * @description 居家式個案收費單
     * @member
     */
    this.HCCaseBill = {
      /**
       * @type {number} version
       * @description 版本設定
       * @member
       */
      version: null,
      /**
       * @type {number} itemTimePeriodView
       * @description 項目時段顯示設定
       * @member
       */
      itemTimePeriodView: null,
    };
    /**
     * @type {object} DCCaseBill
     * @description 社區式個案收費單
     * @member
     */
    this.DCCaseBill = {
      /**
       * @type {number} version
       * @description 版本設定
       * @member
       */
      version: null,
    };
    /**
     * @type {object} caseReceipt
     * @description 收據編號規則
     * @member
     */
    this.caseReceipt = {
      /**
       * @type {string} customText1
       * @description 收據前綴
       * @member
       */
      customText1: '',
      /**
       * @type {string} customText2
       * @description 收據後綴
       * @member
       */
      customText2: '',
      /**
       * @type {number} serialNumber
       * @description 收據序號
       * @member
       */
      serialNumber: 1,
    };
    /**
     * @type {object} stamps
     * @description 印章
     * @member
     */
    this.stamps = {
      /**
       * @type {file} institutionStamp
       * @description 機構單位印章
       * @member
       */
      institutionStamp: new FileObject(),
      /**
       * @type {file} principalStamp
       * @description 負責人印章
       * @member
       */
      principalStamp: new FileObject(),
      /**
       * @type {file} accountingStamp
       * @description 會計印章
       * @member
       */
      accountingStamp: new FileObject(),
      /**
       * @type {file} handlerStamp
       * @description 經手人印章
       * @member
       */
      handlerStamp: new FileObject(),
    };
    /**
     * @type {object} idealTime
     * @description 登入限制閒置時間
     * @member
     */
    this.idealTime = {
      /**
       * @type {number} limitMinutes
       * @description 限制閒置時間(min.)
       * @member
       */
      limitMinutes: null,
      /**
       * @type {number} alertMinute
       * @description 自動登出前提醒(min.)
       * @member
       */
      alertMinute: null,
    };
    /**
     * @type {object} punchTime
     * @description 月薪制預設打卡時間
     * @member
     */
    this.punchTime = {
      /**
       * @type {date} punchIn
       * @description 上班打卡時間
       * @member
       */
      punchIn: null,
      /**
       * @type {date} punchOut
       * @description 下班打卡時間
       * @member
       */
      punchOut: null,
      /**
       * @type {date} lunchBreakStart
       * @description 午休開始時間
       * @member
       */
      lunchBreakStart: null,
      /**
       * @type {date} lunchBreakEnd
       * @description 午休結束時間
       * @member
       */
      lunchBreakEnd: null,
    };
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  bindSource(source) {
    const sourceKeys = Object.keys(source);
    for (const k of sourceKeys) {
      // eslint-disable-next-line no-prototype-builtins
      if (!this.hasOwnProperty(k)) {
        this[k] = source[k];
      }
    }
    return this;
  }

  checkTimeFormat(value, errString) {
    if (value && CustomValidator.nonEmptyString(value) && !CustomRegex.hourMinuteFormat(value)) {
      throw new CustomError(errString);
    }
  }

  checkMinuteFormat(value, errString) {
    if (value && !CustomValidator.isNumber(value)) {
      throw new CustomError(errString);
    }
  }

  checkBoolean(value, errString) {
    if (value && !CustomValidator.isBoolean(value)) {
      throw new CustomError(errString);
    }
  }

  checkRequired(serviceList) {
    new CustomValidator()
      .checkThrows(this.idealTime.limitMinutes,
        { fn: (val) => val, m: coreErrorCodes.ERR_INST_SET_LIMIT_MINUTE_EMPTY },
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_INST_SET_LIMIT_MINUTE_WRONG_FORMAT })
      .checkThrows(this.idealTime.alertMinute,
        { fn: (val) => val, m: coreErrorCodes.ERR_INST_SET_ALERT_MINUTE_EMPTY },
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_INST_SET_ALERT_MINUTE_WRONG_FORMAT });

    if (this.employeeCategory) {
      if (!Array.isArray(this.employeeCategory)) {
        throw new models.CustomError(coreErrorCodes.ERR_INST_SET_EMPLOYEE_CATEGORY_WRONG_TYPE);
      }
    }

    if (this.punchTime) {
      if (this.punchTime.punchIn) {
        new CustomValidator()
          .checkThrows(this.punchTime.punchIn,
            { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_INST_SET_SHIFT_SCHEDULE_START_TIME_WRONG_FORMAT });
      }

      if (this.punchTime.punchOut) {
        new CustomValidator()
          .checkThrows(this.punchTime.punchOut,
            { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_INST_SET_SHIFT_SCHEDULE_START_TIME_WRONG_FORMAT });
      }

      if (this.punchTime.lunchBreakStart) {
        new CustomValidator()
          .checkThrows(this.punchTime.lunchBreakStart,
            { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_INST_SET_SHIFT_SCHEDULE_START_TIME_WRONG_FORMAT });
      }

      if (this.punchTime.lunchBreakEnd) {
        new CustomValidator()
          .checkThrows(this.punchTime.lunchBreakEnd,
            { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_INST_SET_SHIFT_SCHEDULE_START_TIME_WRONG_FORMAT });
      }
    }

    for (const service of serviceList) {
      switch (service) {
        case companyServiceCodes.HC:
          new CustomValidator()
            .checkThrows(this.HCShiftScheduleRules.startTime,
              { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_INST_SET_SHIFT_SCHEDULE_START_TIME_EMPTY },
              { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_INST_SET_SHIFT_SCHEDULE_START_TIME_WRONG_FORMAT })
            .checkThrows(this.HCShiftScheduleRules.endTime,
              { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_INST_SET_SHIFT_SCHEDULE_END_TIME_EMPTY },
              { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_INST_SET_SHIFT_SCHEDULE_END_TIME_WRONG_FORMAT })
            .checkThrows(this.HCShiftScheduleRules.minInternal,
              { fn: (val) => val, m: coreErrorCodes.ERR_INST_SET_MIN_INTERNAL_EMPTY },
              { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_INST_SET_MIN_INTERNAL_WRONG_FORMAT })
            .checkThrows(this.HCCentralServiceReport.splitType,
              { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_INST_SET_CENTRAL_SERVICE_SPLIT_EMPTY },
              { fn: (val) => Object.values(centralServiceSplitCodes.HC).includes(val), m: coreErrorCodes.ERR_INST_SET_CENTRAL_SERVICE_SPLIT_WRONG_VALUE })
            .checkThrows(this.HCCentralServiceReport.timeType,
              { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_INST_SET_CENTRAL_SERVICE_TIME_EMPTY },
              { fn: (val) => Object.values(centralServiceTimeCodes.HC).includes(val), m: coreErrorCodes.ERR_INST_SET_CENTRAL_SERVICE_TIME_WRONG_VALUE })
            .checkThrows(this.HCCaseBill.version,
              { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_INST_SET_CASE_BILL_VERSION_EMPTY },
              { fn: (val) => Object.values(caseBillVersionCodes.HC).includes(val), m: coreErrorCodes.ERR_INST_SET_CASE_BILL_VERSION_WRONG_VALUE })
            .checkThrows(this.HCCaseBill.itemTimePeriodView,
              { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_INST_SET_CASE_BILL_TIME_EMPTY },
              { fn: (val) => Object.values(caseBillTimeCodes.HC).includes(val), m: coreErrorCodes.ERR_INST_SET_CASE_BILL_TIME_WRONG_VALUE });
          break;
        case companyServiceCodes.DC:
          new CustomValidator()
            .checkThrows(this.DCCentralServiceReport.splitType,
              { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_INST_SET_CENTRAL_SERVICE_SPLIT_EMPTY },
              { fn: (val) => Object.values(centralServiceSplitCodes.DC).includes(val), m: coreErrorCodes.ERR_INST_SET_CENTRAL_SERVICE_SPLIT_WRONG_VALUE })
            .checkThrows(this.DCCaseBill.version,
              { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_INST_SET_CASE_BILL_VERSION_EMPTY },
              { fn: (val) => Object.values(caseBillVersionCodes.DC).includes(val), m: coreErrorCodes.ERR_INST_SET_CASE_BILL_VERSION_WRONG_VALUE })
            .checkThrows(this.DCServiceTime.fullDayStartTime,
              { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_EMPTY },
              { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_WRONG_FORMAT })
            .checkThrows(this.DCServiceTime.fullDayEndTime,
              { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_EMPTY },
              { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_WRONG_FORMAT })
            .checkThrows(this.DCServiceTime.beforeNoonStartTime,
              { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_EMPTY },
              { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_WRONG_FORMAT })
            .checkThrows(this.DCServiceTime.beforeNoonEndTime,
              { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_EMPTY },
              { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_WRONG_FORMAT })
            .checkThrows(this.DCServiceTime.afterNoonStartTime,
              { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_EMPTY },
              { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_WRONG_FORMAT })
            .checkThrows(this.DCServiceTime.afterNoonEndTime,
              { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_EMPTY },
              { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_WRONG_FORMAT })
            .checkThrows(this.DCServiceTime.communityDinnerStartTime,
              { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_EMPTY },
              { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_WRONG_FORMAT })
            .checkThrows(this.DCServiceTime.communityDinnerEndTime,
              { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_EMPTY },
              { fn: (val) => CustomRegex.hourMinuteFormat(val), m: coreErrorCodes.ERR_INST_SET_SERVICE_TIME_WRONG_FORMAT });

          this.checkBoolean(this.DCAutoPunch.onShuttleArrived, coreErrorCodes.ERR_INST_SET_ON_SHUTTLE_ARRIVED_WRONG_FORMAT);
          this.checkBoolean(this.DCAutoPunch.onTempMeasured, coreErrorCodes.ERR_INST_SET_ON_TEMP_MEASURED_WRONG_FORMAT);
          this.checkBoolean(this.DCAutoPunch.useShiftScheduleTime, coreErrorCodes.ERR_INST_SET_USE_SHIFT_SCHEDULE_TIME_WRONG_FORMAT);
          this.checkBoolean(this.DCAutoPunch.linkingUpBBCodeTime, coreErrorCodes.ERR_INST_SET_LINKING_UP_BBCODE_TIME_WRONG_FORMAT);

          this.checkBoolean(this.DCServiceTime.shiftScheduleBCode, coreErrorCodes.ERR_INST_SET_USE_SHIFT_SCHEDULE_BCODE_WRONG_FORMAT);
          this.checkMinuteFormat(this.DCServiceTime.fullDayShuttleTime, coreErrorCodes.ERR_INST_SET_SERVICE_SHUTTLE_TIME_WRONG_FORMAT);
          this.checkMinuteFormat(this.DCServiceTime.beforeNoonShuttleTime, coreErrorCodes.ERR_INST_SET_SERVICE_SHUTTLE_TIME_WRONG_FORMAT);
          this.checkMinuteFormat(this.DCServiceTime.afterNoonShuttleTime, coreErrorCodes.ERR_INST_SET_SERVICE_SHUTTLE_TIME_WRONG_FORMAT);
          this.checkMinuteFormat(this.DCServiceTime.communityAssistBathTime, coreErrorCodes.ERR_INST_SET_SERVICE_BATH_TIME_WRONG_FORMAT);
          break;
        case companyServiceCodes.RC:
          new CustomValidator()
            .checkThrows(this.RCShiftScheduleRules.forbiddenLessHours,
              { fn: (val) => val, m: coreErrorCodes.ERR_INST_SET_FORBIDDEN_LESS_HOURS_EMPTY },
              { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_INST_SET_FORBIDDEN_LESS_HOURS_WRONG_FORMAT })
            .checkThrows(this.RCShiftScheduleRules.warningOverHours,
              { fn: (val) => val, m: coreErrorCodes.ERR_INST_SET_WARNING_OVER_HOURS_EMPTY },
              { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_INST_SET_WARNING_OVER_HOURS_WRONG_FORMAT })
            .checkThrows(this.RCShiftScheduleRules.warningLessHours,
              { fn: (val) => val, m: coreErrorCodes.ERR_INST_SET_WARNING_LESS_HOURS_EMPTY },
              { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_INST_SET_WARNING_LESS_HOURS_WRONG_FORMAT });
          break;
        default:
          break;
      }
    }
    return this;
  }

  toView() {
    return {
      employeeCategory: this.employeeCategory,
      advancedSalary: this.advancedSalary,
      caseReceipt: this.caseReceipt,
      idealTime: this.idealTime,
      punchTime: this.punchTime,
      HCShiftScheduleRules: this.HCShiftScheduleRules,
      HCCentralServiceReport: this.HCCentralServiceReport,
      HCCaseBill: this.HCCaseBill,
      DCAutoPunch: this.DCAutoPunch,
      DCServiceTime: this.DCServiceTime,
      DCCentralServiceReport: this.DCCentralServiceReport,
      DCCaseBill: this.DCCaseBill,
      RCShiftScheduleRules: this.RCShiftScheduleRules,
    };
  }
}

module.exports = CompanyInstitutionSetting;
