/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const {
  coreErrorCodes,
  caseSourceCodes,
  reliefTypeCodes,
  casePipelineServiceCodes,
  caseRcServiceItemCodes,
  caseServiceStatusCodes,
  companyServiceCodes,
  billPlaceTypeCodes,
  livingArrangementCodes,
  PlaceObject,
} = require('../../../domain');
/**
* @class
* @classdesc inherit UpdateReviewRequest
*/
class CreateCaseServiceRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
    * @type {string} caseNumber
    * @description 案號
    * @member
    */
    this.caseNumber = null;
    /**
    * @type {string} height
    * @description 身高
    * @member
    */
    this.height = null;
    /**
    * @type {string} weight
    * @description 體重
    * @member
    */
    this.weight = null;
    /**
    * @type {string} calfGirth
    * @description 小腿圍
    * @member
    */
    this.calfGirth = null;
    /**
    * @type {string} category
    * @description 個案分類
    * @member
    */
    this.category = null;
    /**
    * @type {string} source
    * @description 個案來源
    * @member
    */
    this.source = null;
    /**
    * @type {string} reliefType
    * @description 福利身分別
    * @member
    */
    this.reliefType = null;
    /**
    * @type {string} livingArrangement
    * @description 居住狀況
    * @member
    */
    this.livingArrangement = null;
    /**
    * @type {string} syncVitalSignToDM
    * @description 同步生理數據
    * @member
    */
    this.syncVitalSignToDM = null;
    /**
    * @type {Array<Number>} livingWith
    * @description 同住人員
    * @member
    */
    this.livingWith = [];
    /**
     * @type {Number} billPlace
     * @description 帳單地址
     * @member
     */
    this.billPlaceType = null;
    /**
    * @type {string} billPlace
    * @description 帳單地址
    * @member
    */
    this.billPlace = new PlaceObject();
    /**
     * @type {String} billNote
     * @description 帳單備註
     * @member
     */
    this.billNote = '';
    /**
    * @type {Array<Number>} pipelineService
    * @description 管路服務
    * @member
    */
    this.pipelineService = [];
    /**
    * @type {string} masterHomeservicerId
    * @description 主責居服員
    * @member
    */
    this.masterHomeservicerId = null;
    /**
    * @type {string} supervisorId
    * @description 主督導員
    * @member
    */
    this.supervisorId = null;
    /**
    * @type {string} subSupervisorId
    * @description 副督導員
    * @member
    */
    this.subSupervisorId = null;
    /**
    * @type {Number} companyDistance
    * @description 和機構的距離
    * @member
    */
    this.companyDistance = null;
    /**
    * @type {Boolean} residencePlacebyCoordinate
    * @description 服務地址 - 經緯度是否手動輸入
    * @member
    */
    this.residencePlacebyCoordinate = null;
    /**
    * @type {string} careAttendantId
    * @description 照服員
    * @member
    */
    this.careAttendantId = null;
    /**
    * @type {string} locationName
    * @description 據點名稱
    * @member
    */
    this.locationName = null;
    /**
    * @type {string} outboundDriverId
    * @description 司機(去程)
    * @member
    */
    this.outboundDriverId = null;
    /**
    * @type {string} inboundDriverId
    * @description 司機(回程)
    * @member
    */
    this.inboundDriverId = null;
    /**
    * @type {string} outboundShuttleOwnExpenseItem
    * @description 交通車超額自費項目(去程)
    * @member
    */
    this.outboundShuttleOwnExpenseItem = null;
    /**
    * @type {string} inboundShuttleOwnExpenseItem
    * @description 交通車超額自費項目(回程)
    * @member
    */
    this.inboundShuttleOwnExpenseItem = null;
    /**
    * @type {string} rcServiceItem
    * @description 住宿型服務項目
    * @member
    */
    this.rcServiceItem = null;
    /**
    * @type {string} scheduledStartDate
    * @description 預計服務開始時間
    * @member
    */
    this.scheduledStartDate = null;
    /**
    * @type {string} scheduledEndDate
    * @description 預計服務結束時間
    * @member
    */
    this.scheduledEndDate = null;
    /**
    * @type {string} importDate
    * @description 匯入日期
    * @member
    */
    this.importDate = null;
    /**
    * @type {string} caseManagerId
    * @description 主責個管員ID
    * @member
    */
    this.caseManagerId = null;
    /**
    * @type {string} subCaseManagerId
    * @description 副個管員ID
    * @member
    */
    this.subCaseManagerId = null;
    /**
    * @type {string} careManagerId
    * @description 照管員ID
    * @member
    */
    this.careManagerId = null;
    /**
     * @type {String} medicalRecordNumber
     * @description 病歷號碼
     * @member
     */
    this.medicalRecordNumber = null;
    /**
    * @type {string} status
    * @description 個案狀態
    * @member
    */
    this.status = 0;
    /**
    * @type {string} startDate
    * @description 服務開始日期
    * @member
    */
    this.startDate = null;
    /**
    * @type {string} endDate
    * @description 服務結束日期
    * @member
    */
    this.endDate = null;
    /**
    * @type {string} code
    * @description 案號(程式產生)
    * @member
    */
    this.code = null;
    /**
    * @type {Date} openDate
    * @description 開案日期
    * @member
    */
    this.openDate = null;
    /**
    * @type {Number} approvedRatio
    * @description 補助額度%
    * @member
    */
    this.approvedRatio = null;
    /**
    * @type {Boolean} service10711Flag
    * @description 10711新支付
    * @member
    */
    this.service10711Flag = null;
    /**
    * @type {Object} serviceTimeRequired
    * @description 自訂服務項目時間
    * @member
    */
    this.serviceTimeRequired = null;
    /**
    * @type {number} welfareType
    * @description 福利別(機構客製)
    * @member
    */
    this.welfareType = null;
    /**
    * @type {number} paymentMethod
    * @description 繳款方式(宜蘭康活、宜蘭舒活客製功能)
    * @member
    */
    this.paymentMethod = null;
    /**
    * @type {number} additionalSource
    * @description 來源(天晟醫院金色年代客製)
    * @member
    */
    this.additionalSource = null;
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  bindCompanyId(companyId = '') {
    this.companyId = companyId;
    return this;
  }

  bindEndDate(endDate = new Date()) {
    this.endDate = endDate;
    return this;
  }

  bindRequestService(service = '') {
    this.requestService = service;
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    new CustomValidator().nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY);
    if (this.livingArrangement !== null) {
      new CustomValidator().checkThrows(this.livingArrangement,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_LIVING_ARRANGEMENT_EMPTY },
        { fn: (val) => Object.values(livingArrangementCodes).includes(val), m: coreErrorCodes.ERR_LIVING_ARRANGEMENT_WRONG_VALUE });
    }

    if (this.requestService) {
      if ([companyServiceCodes.HC, companyServiceCodes.DC, companyServiceCodes.RC].includes(this.requestService)) {
        new CustomValidator()
          .checkThrows(this.billPlaceType,
            { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_BILL_PLACE_TYPE_EMPTY },
            { fn: (val) => Object.values(billPlaceTypeCodes).includes(val), m: coreErrorCodes.ERR_BILL_PLACE_TYPE_WRONG_VALUE });
      }
    }

    if (this.source) {
      new CustomValidator().checkThrows(this.source, {
        m: coreErrorCodes.ERR_CASE_SOURCE_WRONG_VALUE,
        fn: (val) => Object.values(caseSourceCodes).includes(val),
      });
    }

    if (this.reliefType) {
      new CustomValidator().checkThrows(this.reliefType, {
        m: coreErrorCodes.ERR_RELIEF_TYPE_NOT_FOUND,
        fn: (val) => Object.values(reliefTypeCodes).includes(val),
      });
    }

    if (CustomValidator.nonEmptyArray(this.pipelineService)) {
      new CustomValidator().checkThrows(this.pipelineService, {
        m: coreErrorCodes.ERR_PIPELINE_SERVICE_NOT_FOUND,
        fn: (val) => val.every((s) => Object.values(casePipelineServiceCodes).includes(s)),
      });
    }

    if (this.rcServiceItem) {
      new CustomValidator().checkThrows(this.rcServiceItem, {
        m: coreErrorCodes.ERR_RC_SERVICE_ITEM_NOT_FOUND,
        fn: (val) => Object.values(caseRcServiceItemCodes).includes(val),
      });
    }

    if (this.status) {
      new CustomValidator().checkThrows(this.status, {
        m: coreErrorCodes.ERR_CASE_SERVICE_STATUS_NOT_FOUND,
        fn: (val) => Object.values(caseServiceStatusCodes).includes(val),
      });
    }

    if (CustomValidator.nonEmptyString(this.scheduledStartDate)) {
      new CustomValidator().checkThrows(this.scheduledStartDate, {
        m: coreErrorCodes.ERR_CASE_SCHEDULED_START_DATE_WRONG_FORMAT,
        fn: (val) => CustomRegex.dateFormat(val),
      });
    }

    if (CustomValidator.nonEmptyString(this.scheduledEndDate)) {
      new CustomValidator().checkThrows(this.scheduledEndDate, {
        m: coreErrorCodes.ERR_CASE_SCHEDULED_END_DATE_WRONG_FORMAT,
        fn: (val) => CustomRegex.dateFormat(val),
      });
    }

    if (CustomValidator.nonEmptyString(this.importDate)) {
      new CustomValidator().checkThrows(this.importDate, {
        m: coreErrorCodes.ERR_CASE_IMPORT_DATE_WRONG_FORMAT,
        fn: (val) => CustomRegex.dateFormat(val),
      });
    }

    if (CustomValidator.nonEmptyString(this.startDate)) {
      new CustomValidator().checkThrows(this.startDate, {
        m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT,
        fn: (val) => CustomRegex.dateFormat(val),
      });
    }

    if (CustomValidator.nonEmptyString(this.endDate)) {
      new CustomValidator().checkThrows(this.endDate, {
        m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT,
        fn: (val) => CustomRegex.dateFormat(val),
      });
    }
    return this;
  }
}

module.exports = CreateCaseServiceRequest;
