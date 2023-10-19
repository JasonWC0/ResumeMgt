/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, employeeStatusCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class PersonnelChangeEmployeeRequest extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {String} companyId
     * @description 公司ID
     * @member
     */
    this.companyId = null;
    /**
     * @type {String} personId
     * @description 個人ID
     * @member
     */
    this.personId = null;
    /**
     * @type {Number} employeeStatus
     * @description 職務狀態
     * @member
     */
    this.employeeStatus = null;
    /**
     * @type {String} employeeStatus
     * @description 職務異動日，若職務狀態為離職，此日期為離職日；若職務狀態為復職，此日期需記錄在職務歷史紀錄的復職日期中
     * @member
     */
    this.date = null;
    /**
    * @type {String} nextSupervisorId
    * @description 若為離職時，且員工為督導角色時，指派此人員為下任督導
    * @member
    */
    this.nextSupervisorId = null;
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  bindPersonId(personId = '') {
    this.personId = personId;
    return this;
  }

  bindCompanyId(companyId = '') {
    this.companyId = companyId;
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .nonEmptyStringThrows(this.personId, coreErrorCodes.ERR_PERSON_ID_IS_EMPTY)
      .checkThrows(this.employeeStatus, {
        fn: (val) => Object.values(employeeStatusCodes).includes(val),
        m: coreErrorCodes.ERR_EMPLOYEE_STATUS_WRONG_VALUE,
      })
      .checkThrows(this.date, {
        fn: (val) => CustomRegex.dateFormat(val),
        m: coreErrorCodes.ERR_FILL_DATE_WRONG_FORMAT,
      });
    return this;
  }
}

module.exports = PersonnelChangeEmployeeRequest;
