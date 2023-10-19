/**
 * FeaturePath: Common-Entity--員工物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const coreErrorCodes = require('../enums/error-codes');
const ComPersonMgmtObject = require('./company-person-management-object');
const EmployeeContactObject = require('./employee-contact-object');
const serviceItemQualificationCodes = require('../enums/service-item-qualification-codes');
const BaseEntity = require('../entity/base-entity');

/**
 * @class
 * @classdesc Represents employee object
 */
class EmployeeObject extends BaseEntity {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {array<ComPersonMgmtObject>} comPersonMgmt
     * @description 公司人事管理
     * @member {array<ComPersonMgmtObject>}
     */
    this.comPersonMgmt = [];
    /**
     * @type {EmployeeContactObject} contacts
     * @description 聯絡人
     * @member {EmployeeContactObject}
     */
    this.contact = new EmployeeContactObject();
    /**
     * @type {Array<Number>} serviceItemQualification
     * @description 具備訓練課程與證照之服務項目
     * @member {serviceItemQualification}
     */
    this.serviceItemQualification = [];
    /**
     * @type {String} employeeCategory
     * @description 員工分類
     * @member {employeeCategory}
     */
    this.employeeCategory = null;
  }

  bind(data) {
    super.bind(data, this);

    this.contact = (!CustomValidator.isEqual(data.contact, new EmployeeContactObject()))
      ? new EmployeeContactObject().bind(data.contact)
      : new EmployeeContactObject();

    if (CustomValidator.nonEmptyArray(data.comPersonMgmt)) {
      this.comPersonMgmt = data.comPersonMgmt.map((cpm) => {
        const nCpm = new ComPersonMgmtObject().bind(cpm);
        nCpm.bindCompanyId(cpm.companyId.toString());
        if (CustomValidator.nonEmptyString(cpm.supervisorId)) {
          nCpm.bindSupervisorId(cpm.supervisorId.toString());
        }
        if (CustomValidator.nonEmptyString(cpm.supervisor2Id)) {
          nCpm.bindSupervisor2Id(cpm.supervisor2Id.toString());
        }
        return nCpm;
      });
    }
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    if (CustomValidator.nonEmptyArray(this.comPersonMgmt)) {
      this.comPersonMgmt.forEach((cpm) => cpm.checkRequired());
    }
    if (CustomValidator.nonEmptyArray(this.serviceItemQualification)) {
      new CustomValidator()
        .checkThrows(this.serviceItemQualification, {
          m: coreErrorCodes.ERR_SERVICE_ITEM_QUALIFICATION_WRONG_VALUE,
          fn: (val) => val.every((s) => Object.values(serviceItemQualificationCodes).includes(s)),
        });
    }
    return this;
  }

  /**
  * @method
  * @description Return formated info
  * @returns {Object}
  */
  responseInfo() {
    return {
      employeeNum: this.employeeNum,
      startDate: this.startDate,
      endDate: this.endDate,
      employeeStatus: this.employeeStatus,
      comPersonMgmt: this.comPersonMgmt.map((cpm) => cpm.toView()),
      contacts: this.contacts.map((c) => c.responseInfo()),
      serviceItemQualification: this.serviceItemQualification,
      employeeCategory: this.employeeCategory,
    };
  }
}

module.exports = EmployeeObject;
