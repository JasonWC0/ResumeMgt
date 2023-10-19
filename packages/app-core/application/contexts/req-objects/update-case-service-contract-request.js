/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-case-service-contract-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-12-05 05:18:53 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const {
  coreErrorCodes,
  companyServiceCodes,
  FileObject,
} = require('../../../domain');

class UpdateCaseServiceContractRequest extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} service
     * @description 服務類型
     * @member
     */
    this.service = '';
    /**
     * @type {string} principal
     * @description 委託人姓名
     * @member
     */
    this.principal = '';
    /**
     * @type {string} startDate
     * @description 合約起始日期
     * @member
     */
    this.startDate = '';
    /**
     * @type {string} endDate
     * @description 合約結束日期
     * @member
     */
    this.endDate = '';
    /**
     * @type {FileObject} file
     * @description 合約書檔案
     * @member
     */
    this.file = new FileObject();
  }

  bind(data) {
    super.bind(data, this);
    this.file = data.file ? new FileObject().bind(data.file) : null;
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .checkThrows(this.service,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_CONTRACT_SERVICE_IS_EMPTY },
        { fn: (val) => Object.values(companyServiceCodes).includes(val), m: coreErrorCodes.ERR_SERVICE_WRONG_VALUE })
      .checkThrows(this.startDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_START_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT });
    if (CustomValidator.nonEmptyString(this.endDate)) {
      new CustomValidator()
        .checkThrows(this.endDate,
          { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT });
    }
    if (this.file) {
      this.file.checkRequired();
    }
    return this;
  }
}

module.exports = UpdateCaseServiceContractRequest;
