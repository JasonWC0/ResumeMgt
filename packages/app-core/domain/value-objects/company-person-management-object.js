/**
 * FeaturePath: Common-Entity--員工資料物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const customerErrorCodes = require('../enums/error-codes');
const ReportingAgentObject = require('./reporting-agent-object');
const SalarySettingObject = require('./salary-setting-object');
const employmentTypeCodes = require('../enums/employment-type-codes');

/**
 * @class
 * @classdesc Represents company person management object
 */
class ComPersonMgmtObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} employeeNum
     * @description 員工編號
     * @member
     */
    this.employeeNum = null;
    /**
     * @type {string} companyId
     * @description 公司ID
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} supervisorId
     * @description 直屬主管
     * @member
     */
    this.supervisorId = null;
    /**
     * @type {string} supervisor2Id
     * @description 直屬副主管
     * @member
     */
    this.supervisor2Id = null;
    /**
     * @type {string} roles
     * @description 角色列表
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
    * @description 分類(機構自定義)
    * @member
    */
    this.employeeCategory = null;
    /**
     * @type {string} centralGovSystemAccount
     * @description 中央系統帳號
     * @member
     */
    this.centralGovSystemAccount = null;
    /**
     * @type {Number} salarySystem
     * @description 薪制
     * @member
     */
    this.salarySystem = 0;
    /**
    * @type {string} weekHours
    * @description 每週最大工時
    * @member
    */
    this.weekHours = null;
    /**
     * @type {ReportingAgentObject} reportingAgent
     * @description 申報代表人
     * @member
     */
    this.reportingAgent = new ReportingAgentObject();
    /**
    * @type {array<string>} serviceRegion
    * @description 服務區域
    * @member
    */
    this.serviceRegion = [];
    /**
    * @type {string} interviewNote
    * @description 面試內容
    * @member
    */
    this.interviewNote = null;
    /**
    * @type {date} startDate
    * @description 到職日期
    * @member
    */
    this.startDate = null;
    /**
    * @type {date} endDate
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
    /**
     * @type {SalarySettingObject} salarySetting
     * @description 薪資設定
     * @member
     */
    this.salarySetting = new SalarySettingObject();
    /**
     * @type {Object} apnToken
     * @description iOS Token
     * @member
     */
    this.apnToken = null;
    /**
     * @type {Object} gcmToken
     * @description android Token
     * @member
     */
    this.gcmToken = null;
    /**
     * @type {Number} latitude
     * @description 服務地址--緯度
     * @member
     */
    this.latitude = null;
    /**
     * @type {Number} longitude
     * @description 服務地址--經度
     * @member
     */
    this.longitude = null;
    /**
     * @type {Number} serialNumberForBankBill
     * @description 銀行繳費明細表-流水號
     * @member
     */
    this.serialNumberForBankBill = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  bindCompanyId(companyId = '') {
    this.companyId = companyId;
    return this;
  }

  bindSupervisorId(supervisorId = '') {
    this.supervisorId = supervisorId;
    return this;
  }

  bindSupervisor2Id(supervisor2Id = '') {
    this.supervisor2Id = supervisor2Id;
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, customerErrorCodes.ERR_COMPANY_ID_EMPTY)
      .checkThrows(this.roles,
        {
          m: customerErrorCodes.ERR_EMPLOYEE_ROLES_IS_EMPTY,
          fn: (val) => CustomValidator.nonEmptyArray(val),
        })
      .checkThrows(this.reportingAgent,
        {
          m: customerErrorCodes.ERR_EMPLOYEE_REPORTING_AGENT_EMPTY,
          fn: (val) => !CustomValidator.isEqual(val, new ReportingAgentObject()),
        })
      .checkThrows(this.employmentType,
        {
          m: customerErrorCodes.ERR_EMPLOYEE_EMPLOYMENT_TYPE_WRONG_VALUE,
          fn: (val) => Object.values(employmentTypeCodes).includes(val),
        });
  }

  /**
  * @method
  * @description Return formated info
  * @returns {Object}
  */
  toView() {
    return {
      companyId: this.companyId.toString(),
      supervisorId: this.supervisorId.toString(),
      supervisor2Id: this.supervisor2Id.toString(),
      salarySystem: this.salarySystem,
      roles: this.roles,
      employeeCategory: this.employeeCategory,
    };
  }
}

module.exports = ComPersonMgmtObject;
