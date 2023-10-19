/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: read-case-service-contract-list-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-12-02 02:48:54 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex, CustomUtils } = require('@erpv3/app-common/custom-tools');
const {
  coreErrorCodes,
  companyServiceCodes,
} = require('../../../domain');

class ReadCaseServiceContractListRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} service
     * @description 個案服務類型
     * @member
     */
    this.service = '';
    /**
     * @type {string} caseName
     * @description 個案姓名
     * @member
     */
    this.caseName = '';
    /**
     * @type {string} principal
     * @description 委託人姓名
     * @member
     */
    this.principal = '';
    /**
     * @type {string} sDateF
     * @description 合約起始日，搜尋區間起始日期
     * @member
     */
    this.sDateF = '';
    /**
     * @type {string} sDateE
     * @description 合約起始日，搜尋區間結束日期
     * @member
     */
    this.sDateE = '';
    /**
     * @type {string} eDateF
     * @description 合約結束日，搜尋區間起始日期
     * @member
     */
    this.eDateF = '';
    /**
     * @type {string} eDateE
     * @description 合約結束日，搜尋區間結束日期
     * @member
     */
    this.eDateE = '';
    /**
     * @type {boolean} hasHCContract
     * @description 居家式上傳合約
     * @member
     */
    this.hasHCContract = null;
    /**
     * @type {boolean} hasDCContract
     * @description 社區式上傳合約
     * @member
     */
    this.hasDCContract = null;
    /**
     * @type {boolean} hasRCContract
     * @description 住宿式上傳合約
     * @member
     */
    this.hasRCContract = null;
    /**
     * @type {number} skip
     * @description 分頁用，略過筆數
     * @member
     */
    this.skip = null;
    /**
     * @type {number} limit
     * @description 分頁用，每次取出筆數
     * @member
     */
    this.limit = null;
    /**
     * @type {string} caseOrder
     * @description 個案排列順序
     * @member
     */
    this.caseOrder = '-createdAt';
    /**
     * @type {string} contractOrder
     * @description 合約排列順序
     * @member
     */
    this.contractOrder = 'startDate';
  }

  bind(data) {
    super.bind(data, this);
    if (this.skip) { this.skip = Number.isNaN(Number(this.skip)) ? null : Number(this.skip); }
    if (this.limit) { this.limit = Number.isNaN(Number(this.limit)) ? null : Number(this.limit); }
    this.service = this.service ? this.service.split(',') : [companyServiceCodes.HC, companyServiceCodes.DC, companyServiceCodes.RC];
    this.hasHCContract = CustomUtils.convertBoolean(data.hasHCContract);
    this.hasDCContract = CustomUtils.convertBoolean(data.hasDCContract);
    this.hasRCContract = CustomUtils.convertBoolean(data.hasRCContract);
    // 預設內部參數是否搜尋開始結束日期
    this.queryStartDate = false;
    this.queryEndDate = false;
    return this;
  }

  bindCompanyId(companyId) {
    this.companyId = companyId;
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .checkThrows(this.skip,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_SKIP_IS_EMPTY })
      .checkThrows(this.limit,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_LIMIT_IS_EMPTY });

    if (CustomValidator.nonEmptyArray(this.service)) {
      this.service.forEach((s) => {
        new CustomValidator().checkThrows(s,
          { fn: (val) => Object.values(companyServiceCodes).includes(val), m: coreErrorCodes.ERR_SERVICE_WRONG_VALUE });
      });
    }

    if (CustomValidator.nonEmptyString(this.sDateF) || CustomValidator.nonEmptyString(this.sDateE)) {
      new CustomValidator()
        .checkThrows(this.sDateF,
          { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_CONTRACT_START_DATE_FROM_DATE_IS_EMPTY },
          { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_CONTRACT_START_DATE_FROM_DATE_WRONG_FORMAT })
        .checkThrows(this.sDateE,
          { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_CONTRACT_START_DATE_END_DATE_IS_EMPTY },
          { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_CONTRACT_START_DATE_END_DATE_WRONG_FORMAT });
      this.queryStartDate = true;
    }
    if (CustomValidator.nonEmptyString(this.eDateF) || CustomValidator.nonEmptyString(this.eDateE)) {
      new CustomValidator()
        .checkThrows(this.eDateF,
          { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_CONTRACT_END_DATE_FROM_DATE_IS_EMPTY },
          { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_CONTRACT_END_DATE_FROM_DATE_WRONG_FORMAT })
        .checkThrows(this.eDateE,
          { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_CONTRACT_END_DATE_END_DATE_IS_EMPTY },
          { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_CONTRACT_END_DATE_END_DATE_WRONG_FORMAT });
      this.queryEndDate = true;
    }

    return this;
  }
}

module.exports = ReadCaseServiceContractListRequest;
