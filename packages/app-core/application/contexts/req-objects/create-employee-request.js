/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { CustomError } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { accountRegex } = require('../req-regex/account-regex-tool');
const {
  coreErrorCodes,
  employmentTypeCodes,
  serviceItemQualificationCodes,
  salarySystemCodes,
  EmployeeContactObject,
  EmployeeObject,
  ReportingAgentObject,
} = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class CreateEmployeeRequest extends EmployeeObject {
  /**
   * @constructor
   */
  constructor() {
    super();
    delete this.comPersonMgmt;
    /**
     * @type {string} companyId
     * @description 公司ID
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} employeeNum
     * @description 員工編號
     * @member
     */
    this.employeeNum = null;
    /**
     * @type {array<string>} roles
     * @description 腳色列表
     * @member
     */
    this.roles = [];
    /**
     * @type {number} employmentType
     * @description 職務類別
     * @member
     */
    this.employmentType = 0;
    /**
     * @type {string} employeeCategory
     * @description 分類
     * @member
     */
    this.employeeCategory = null;
    /**
     * @type {string} account
     * @description 帳號
     * @member
     */
    this.account = null;
    /**
     * @type {string} centralGovSystemAccount
     * @description 中央系統帳號
     * @member
     */
    this.centralGovSystemAccount = null;
    /**
     * @type {string} weekHours
     * @description 每週最大工時
     * @member
     */
    this.weekHours = null;
    /**
     * @type {string} reportingAgent
     * @description 申報代表人
     * @member
     */
    this.reportingAgent = new ReportingAgentObject();
    /**
     * @type {string} supervisorId
     * @description 直屬主管員工
     * @member
     */
    this.supervisorId = null;
    /**
     * @type {string} supervisor2Id
     * @description 副屬主管員工
     * @member
     */
    this.supervisor2Id = null;
    /**
     * @type {Number} salarySystem
     * @description 薪制
     * @member
     */
    this.salarySystem = null;
    /**
     * @type {string} serviceRegion
     * @description 服務區域
     * @member
     */
    this.serviceRegion = null;
    /**
     * @type {string} interviewNote
     * @description 面試內容
     * @member
     */
    this.interviewNote = null;
    /**
     * @type {array<number>} serviceItemQualification
     * @description 服務項目相關課程
     * @member
     */
    this.serviceItemQualification = null;
    /**
     * @type {string} startDate
     * @description 到職日期
     * @member
     */
    this.startDate = null;
    /**
     * @type {string} endDate
     * @description 離職日期
     * @member
     */
    this.endDate = null;
    /**
    * @type {Number} loginPriority
    * @description 預設登入的順序(同帳號多員工)
    * @member
    */
    this.loginPriority = null;
  }

  bind(data = {}) {
    super.bind(data, this);
    try {
      if (data.contact) { this.contact = new EmployeeContactObject().bind(data.contact); }
      if (data.reportingAgent) { this.reportingAgent = new ReportingAgentObject().bind(data.reportingAgent); }
      return this;
    } catch (ex) {
      throw new CustomError('Parse json fail');
    }
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    super.checkRequired();
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .checkThrows(this.startDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_EMPLOYEE_START_DATE_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_EMPLOYEE_START_DATE_WRONG_FORMAT })
      .checkThrows(this.roles, {
        m: coreErrorCodes.ERR_EMPLOYEE_ROLES_IS_EMPTY,
        fn: (val) => CustomValidator.nonEmptyArray(val),
      })
      .checkThrows(this.reportingAgent, {
        m: coreErrorCodes.ERR_EMPLOYEE_REPORTING_AGENT_EMPTY,
        fn: (val) => !CustomValidator.isEqual(val, new ReportingAgentObject()),
      })
      .checkThrows(this.employmentType, {
        m: coreErrorCodes.ERR_EMPLOYEE_EMPLOYMENT_TYPE_WRONG_VALUE,
        fn: (val) => Object.values(employmentTypeCodes).includes(val),
      })
      .checkThrows(this.serviceItemQualification, {
        m: coreErrorCodes.ERR_SERVICE_ITEM_QUALIFICATION_WRONG_VALUE,
        fn: (val) => val.every((s) => Object.values(serviceItemQualificationCodes).includes(s)),
      })
      .checkThrows(this.salarySystem, {
        m: coreErrorCodes.ERR_EMPLOYEE_SALARY_SYSTEM_WRONG_VALUE,
        fn: (val) => Object.values(salarySystemCodes).includes(val),
      });

    if (CustomValidator.nonEmptyString(this.endDate)) {
      new CustomValidator().checkThrows(this.endDate, {
        fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_EMPLOYEE_END_DATE_WRONG_FORMAT,
      });
    }
    this.reportingAgent.checkRequired();

    if (CustomValidator.nonEmptyString(this.account)) {
      accountRegex(this.account);
    }

    return this;
  }
}

module.exports = CreateEmployeeRequest;
