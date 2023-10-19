/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-report-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-09-05 06:38:05 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

class CreateReportRequest extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} companyId
     * @description 公司Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} f
     * @description 開始日期
     * @member
     */
    this.f = '';
    /**
     * @type {string} e
     * @description 結束日期
     * @member
     */
    this.e = '';
    /**
     * @type {array} caseId
     * @description 個案Id列表
     * @member
     */
    this.caseId = [];
    /**
     * @type {string} serviceCode
     * @description 服務代碼
     * @member
     */
    this.serviceCode = '';
    /**
     * @type {string} templateFileName
     * @description 檔案版型名稱
     * @member
     */
    this.templateFileName = '';
    /**
     * @type {string} companyDisplayname
     * @description 機構名稱
     * @member
     */
    this.companyDisplayname = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .checkThrows(this.f,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_START_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT })
      .checkThrows(this.e,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_END_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT });

    return this;
  }
}

module.exports = CreateReportRequest;
