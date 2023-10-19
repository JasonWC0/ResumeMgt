/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { CustomUtils, CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const CreateEmployeeRequest = require('./create-employee-request');
const { coreErrorCodes, salarySystemCodes, ReportingAgentObject } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class UpdateEmployeeRequest extends CreateEmployeeRequest {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} data
     * @description base64 String
     * @member
     */
    this.data = '';
    /**
     * @type {object} dataObj
     * @description base64 String to Object
     * @member
     */
    this.dataObj = {};
  }

  bind(data = {}) {
    super.bind(data, this);
    this.dataObj = CustomUtils.deepCopy(data);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY);

    if (CustomValidator.nonEmptyString(this.startDate)) {
      new CustomValidator().checkThrows(this.startDate,
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_EMPLOYEE_START_DATE_WRONG_FORMAT });
    }

    if (CustomValidator.nonEmptyString(this.endDate)) {
      new CustomValidator().checkThrows(this.endDate,
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_EMPLOYEE_END_DATE_WRONG_FORMAT });
    }

    if (!CustomValidator.isEqual(this.reportingAgent, new ReportingAgentObject())) {
      this.reportingAgent.checkRequired();
    }

    if (this.salarySystem) {
      new CustomValidator().checkThrows(this.salarySystem, {
        m: coreErrorCodes.ERR_EMPLOYEE_SALARY_SYSTEM_WRONG_VALUE,
        fn: (val) => Object.values(salarySystemCodes).includes(val),
      });
    }

    return this;
  }
}

module.exports = UpdateEmployeeRequest;
