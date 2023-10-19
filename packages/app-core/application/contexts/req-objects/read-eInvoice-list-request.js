/* eslint-disable no-multi-spaces */
/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: read-eInvoice-list-request.js
 * Project: @erpv3/app-core
 * File Created: 2023-03-07 03:22:23 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');
const { eInvoiceStatusCodes } = require('../../../domain/enums/eInvoice-codes');

const DATE_TYPE = {
  PAID: 'p',  // 繳費日期
  ISSUED: 'i', // 開立日期
};

/**
* @class
* @classdesc inherit BaseBundle
*/
class ReadEInvoiceListRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} companyId
     * @description 機構Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} status
     * @description 篩選狀態
     * @member
     */
    this.status = '';
    /**
     * @type {string} dateType
     * @description 篩選日期類型
     * @member
     */
    this.dateType = '';
    /**
     * @type {Date} sDate
     * @description 開始日期 YYYY/MM/DD
     * @member
     */
    this.sDate = '';
    /**
     * @type {Date} eDate
     * @description 結束日期 YYYY/MM/DD
     * @member
     */
    this.eDate = '';
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
  }

  bind(data) {
    super.bind(data, this);
    this.status = CustomValidator.nonEmptyString(this.status) ? this.status.split(',').map((s) => Number(s)) : '';
    if (this.skip) { this.skip = Number.isNaN(Number(this.skip)) ? null : Number(this.skip); }
    if (this.limit) { this.limit = Number.isNaN(Number(this.limit)) ? null : Number(this.limit); }
    return this;
  }

  setQDateType() {
    this.queryPaid = !!CustomValidator.isEqual(this.dateType, DATE_TYPE.PAID);
    this.queryIssued = !!CustomValidator.isEqual(this.dateType, DATE_TYPE.ISSUED);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .checkThrows(this.status,
        { s: CustomValidator.strategies.NON_EMPTY_ARRAY, m: coreErrorCodes.ERR_EINVOICE_STATUS_IS_EMPTY })
      .checkThrows(this.dateType,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_EINVOICE_DATE_TYPE_IS_EMPTY },
        { fn: (val) => Object.values(DATE_TYPE).includes(val), m: coreErrorCodes.ERR_EINVOICE_DATE_TYPE_NOT_EXIST })
      .checkThrows(this.sDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_START_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT })
      .checkThrows(this.eDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_END_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT })
      .checkThrows(this.skip,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_SKIP_IS_EMPTY })
      .checkThrows(this.limit,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_LIMIT_IS_EMPTY });

    this.status.forEach((s) => {
      new CustomValidator()
        .checkThrows(s,
          { fn: (val) => Object.values(eInvoiceStatusCodes).includes(val), m: coreErrorCodes.ERR_EINVOICE_STATUS_NOT_EXIST });
    });

    return this;
  }
}

module.exports = ReadEInvoiceListRequest;
