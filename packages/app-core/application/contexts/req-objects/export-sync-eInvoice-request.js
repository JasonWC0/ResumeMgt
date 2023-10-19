/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: export-sync-eInvoice-request.js
 * Project: @erpv3/app-core
 * File Created: 2023-03-13 11:31:50 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const moment = require('moment');
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');
const { termCodes, eInvoiceStatusCodes } = require('../../../domain/enums/eInvoice-codes');

const DATE_FORMAT = 'YYYY/MM/DD';
const MONTH_UNIT = 'M';

/**
* @class
* @classdesc inherit BaseBundle
*/
class ExportSyncEInvoiceRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {Number} year
     * @description 年份 YYYY
     * @member
     */
    this.year = null;
    /**
     * @type {Number} invoiceTerm
     * @description 發票期別
     * @member
     */
    this.invoiceTerm = null;
    /**
     * @type {Number} status
     * @description 發票狀態
     * @member
     */
    this.status = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
   * 將發票期別轉換開始結束日期
   */
  transferToDate() {
    switch (this.invoiceTerm) {
      case termCodes.JanFeb:
        this.sDate = moment(this.year).set(MONTH_UNIT, 1).startOf(MONTH_UNIT).format(DATE_FORMAT);
        this.eDate = moment(this.year).set(MONTH_UNIT, 2).endOf(MONTH_UNIT).format(DATE_FORMAT);
        break;
      case termCodes.MarApr:
        this.sDate = moment(this.year).set(MONTH_UNIT, 3).startOf(MONTH_UNIT).format(DATE_FORMAT);
        this.eDate = moment(this.year).set(MONTH_UNIT, 4).endOf(MONTH_UNIT).format(DATE_FORMAT);
        break;
      case termCodes.MayJun:
        this.sDate = moment(this.year).set(MONTH_UNIT, 5).startOf(MONTH_UNIT).format(DATE_FORMAT);
        this.eDate = moment(this.year).set(MONTH_UNIT, 6).endOf(MONTH_UNIT).format(DATE_FORMAT);
        break;
      case termCodes.JulAug:
        this.sDate = moment(this.year).set(MONTH_UNIT, 7).startOf(MONTH_UNIT).format(DATE_FORMAT);
        this.eDate = moment(this.year).set(MONTH_UNIT, 8).endOf(MONTH_UNIT).format(DATE_FORMAT);
        break;
      case termCodes.SepOct:
        this.sDate = moment(this.year).set(MONTH_UNIT, 9).startOf(MONTH_UNIT).format(DATE_FORMAT);
        this.eDate = moment(this.year).set(MONTH_UNIT, 10).endOf(MONTH_UNIT).format(DATE_FORMAT);
        break;
      case termCodes.NovDec:
        this.sDate = moment(this.year).set(MONTH_UNIT, 11).startOf(MONTH_UNIT).format(DATE_FORMAT);
        this.eDate = moment(this.year).set(MONTH_UNIT, 12).endOf(MONTH_UNIT).format(DATE_FORMAT);
        break;
      default:
        break;
    }
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .checkThrows(this.year,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_YEAR_IS_EMPTY },
        { fn: (val) => CustomRegex.yearFormat(val), m: coreErrorCodes.ERR_YEAR_WRONG_FORMAT })
      .checkThrows(this.invoiceTerm,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_EINVOICE_TERM_IS_EMPTY },
        { fn: (val) => Object.values(termCodes).includes(val), m: coreErrorCodes.ERR_EINVOICE_TERM_NOT_EXIST });

    if (this.status !== null && this.status !== undefined) {
      new CustomValidator()
        .checkThrows(this.status,
          { fn: (val) => Object.values(eInvoiceStatusCodes).includes(val), m: coreErrorCodes.ERR_EINVOICE_STATUS_NOT_EXIST });
    }
    return this;
  }
}

module.exports = ExportSyncEInvoiceRequest;
