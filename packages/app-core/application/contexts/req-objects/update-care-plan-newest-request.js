/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-care-plan-newest-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-06-07 04:25:41 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const {
  coreErrorCodes, reliefTypeCodes, cmsLevelCodes, pricingTypeCodes,
  PaymentObject, DeclaredObject, SupportServiceItemObject,
} = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class UpdateCarePlanNewestRequest extends BaseBundle {
  /**
* @constructor
*/
  constructor() {
    super();
    /**
     * @type {string} planStartDate
     * @description 照顧計畫起始日期(生效日)
     * @member
     */
    this.planStartDate = '';
    /**
     * @type {string} consultingDate
     * @description 照會日期
     * @member
     */
    this.consultingDate = '';
    /**
     * @type {string} acceptConsultingDate
     * @description 接受照會日期
     * @member
     */
    this.acceptConsultingDate = '';
    /**
     * @type {string} visitingDate
     * @description 訪視日期
     * @member
     */
    this.visitingDate = '';
    /**
     * @type {string} firstServiceDate
     * @description 初次服務日期
     * @member
     */
    this.firstServiceDate = '';
    /**
     * @type {number} cmsLevel
     * @description CMS等級
     * @member
     */
    this.cmsLevel = null;
    /**
     * @type {number} reliefType
     * @description 福利身份別
     * @member
     */
    this.reliefType = null;
    /**
     * @type {number} pricingType
     * @description 計價類別
     * @member
     */
    this.pricingType = null;
    /**
     * @type {boolean} foreignCareSPAllowance
     * @description 請外勞照護或領有特照津貼
     * @member
     */
    this.foreignCareSPAllowance = null;
    /**
     * @type {PaymentObject} bcPayment
     * @description 照顧及專業服務(BC碼)
     * @member
     */
    this.bcPayment = new PaymentObject();
    /**
     * @type {PaymentObject} gPayment
     * @description 喘息服務(G碼)
     * @member
     */
    this.gPayment = new PaymentObject();
    /**
     * @type {DeclaredObject} AA08Declared
     * @description AA08申報
     * @member
     */
    this.AA08Declared = new DeclaredObject();
    /**
     * @type {DeclaredObject} AA09Declared
     * @description AA09申報
     * @member
     */
    this.AA09Declared = new DeclaredObject();
    /**
     * @type {boolean} useBA12
     * @description 使用BA12
     * @member
     */
    this.useBA12 = null;
    /**
     * @type {array<SupportServiceItemObject>} serviceItems
     * @description 支援服務項目
     * @member {array<SupportServiceItemObject>}
     */
    this.serviceItems = [];
    /**
     * @type {string} note
     * @description 備註
     * @member
     */
    this.note = '';
  }

  bind(data = {}) {
    super.bind(data, this);

    if (data.bcPayment) { this.bcPayment = new PaymentObject().bindBC(data.bcPayment); }
    if (data.gPayment) { this.gPayment = new PaymentObject().bindG(data.gPayment); }
    if (data.AA08Declared) { this.AA08Declared = new DeclaredObject().bindAA08(data.AA08Declared); }
    if (data.AA09Declared) { this.AA09Declared = new DeclaredObject().bindAA09(data.AA09Declared); }
    if (CustomValidator.nonEmptyArray(data.serviceItems)) {
      data.serviceItems.forEach((value, index) => {
        this.serviceItems[index] = new SupportServiceItemObject().bind(value);
      });
    }
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .checkThrows(this.planStartDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_PLAN_START_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_PLAN_START_DATE_WRONG_FORMAT })
      .checkThrows(this.reliefType,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_RELIEF_TYPE_IS_EMPTY },
        { fn: (val) => Object.values(reliefTypeCodes).includes(val), m: coreErrorCodes.ERR_RELIEF_TYPE_NOT_FOUND })
      .checkThrows(this.useBA12,
        { s: CustomValidator.strategies.IS_BOOL, m: coreErrorCodes.ERR_USE_BA12_WRONG_FORMAT });

    if (CustomValidator.nonEmptyString(this.consultingDate)) {
      new CustomValidator().checkThrows(this.consultingDate,
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_CONSULTING_DATE_WRONG_FORMAT });
    }
    if (CustomValidator.nonEmptyString(this.acceptConsultingDate)) {
      new CustomValidator().checkThrows(this.acceptConsultingDate,
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_ACCEPT_CONSULTING_DATE_WRONG_FORMAT });
    }
    if (CustomValidator.nonEmptyString(this.visitingDate)) {
      new CustomValidator().checkThrows(this.visitingDate,
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_VISITING_DATE_WRONG_FORMAT });
    }
    if (CustomValidator.nonEmptyString(this.firstServiceDate)) {
      new CustomValidator().checkThrows(this.firstServiceDate,
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_FIRST_SERVICE_DATE_WRONG_FORMAT });
    }
    if (this.cmsLevel) {
      new CustomValidator().checkThrows(this.cmsLevel,
        { fn: (val) => Object.values(cmsLevelCodes).includes(val), m: coreErrorCodes.ERR_CMS_LEVEL_NOT_FOUND });
    }
    if (this.pricingType) {
      new CustomValidator().checkThrows(this.pricingType,
        { fn: (val) => Object.values(pricingTypeCodes).includes(val), m: coreErrorCodes.ERR_PRICING_TYPE_NOT_FOUND });
    }
    if (this.foreignCareSPAllowance) {
      CustomValidator.isBoolean(this.foreignCareSPAllowance, coreErrorCodes.ERR_FOREIGN_CARE_SP_ALLOWANCE_WRONG_FORMAT);
    }

    this.bcPayment.checkRequired();
    this.gPayment.checkRequired();
    this.AA08Declared.checkRequired();
    this.AA09Declared.checkRequired(true);
    this.serviceItems.forEach((serviceItem) => {
      serviceItem.checkRequired();
    });
    return this;
  }
}

module.exports = UpdateCarePlanNewestRequest;
