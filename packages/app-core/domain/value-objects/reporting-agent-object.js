/**
 * FeaturePath: Common-Entity--申報代表人物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const coreErrorCodes = require('../enums/error-codes');

class ReportingAgentObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {boolean} isAgent
     * @description 是否為申報代表人
     * @member {boolean}
     */
    this.isAgent = null;
    /**
     * @type {string} agentType
     * @description 申報代表人類別
     * @member {number}
     */
    this.agentType = null;
    /**
     * @type {string} employeeAgent
     * @description 申報代表人的代表人員Id
     * @member {string}
     */
    this.employeeAgent = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    new CustomValidator()
      .checkThrows(this.isAgent, { m: coreErrorCodes.ERR_EMPLOYEE_IS_AGENT_WRONG_VALUE, fn: (val) => CustomValidator.isBoolean(val) });
  }
}

module.exports = ReportingAgentObject;
