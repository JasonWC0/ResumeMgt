/**
 * FeaturePath: Common-Entity--電子發票
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: eInvoice-entity.js
 * Project: @erpv3/app-core
 * File Created: 2023-03-07 02:34:34 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const BaseEntity = require('./base-entity');
const { taxTypeCodes, specialTaxTypeCodes } = require('../enums/eInvoice-codes');
const EInvoiceItemObject = require('../value-objects/eInvoice-item-object');
const EInvoiceCustomerObject = require('../value-objects/eInvoice-customer-object');

/**
* @class
* @classdesc EInvoiceEntity
*/
class EInvoiceEntity extends BaseEntity {
  /**
* @constructor
*/
  constructor() {
    super();
    /**
     * @type {string} id
     * @description ObjectId
     * @member
     */
    this.id = '';
    /**
     * @type {string} companyId
     * @description 機構(公司)Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} serialString
     * @description 結帳編號
     * @member
     */
    this.serialString = '';
    /**
     * @type {string} caseId
     * @description 個案Id
     * @member
     */
    this.caseId = '';
    /**
     * @type {string} invoiceNumber
     * @description 發票號碼
     * @member
     */
    this.invoiceNumber = '';
    /**
     * @type {Date} issuedDate
     * @description 開立時間
     * @member
     */
    this.issuedDate = '';
    /**
     * @type {Number} status
     * @description 狀態
     * @member
     */
    this.status = null;
    /**
     * @type {string} invType
     * @description 字軌類別
     * @member
     */
    this.invType = '';
    /**
     * @type {Number} taxType
     * @description 課稅類別
     * @member
     */
    this.taxType = null;
    /**
     * @type {Number} specialTaxType
     * @description 特種稅額類別
     * @member
     */
    this.specialTaxType = null;
    /**
     * @type {Number} clearanceMark
     * @description 通關方式
     * @member
     */
    this.clearanceMark = null;
    /**
     * @type {Boolean} vat
     * @description 商品單價是否含稅
     * @member
     */
    this.vat = null;
    /**
     * @type {Boolean} print
     * @description 列印與否
     * @member
     */
    this.print = null;
    /**
     * @type {String} printUrl
     * @description 列印網址
     * @member
     */
    this.printUrl = null;
    /**
     * @type {Boolean} donation
     * @description 捐贈與否
     * @member
     */
    this.donation = null;
    /**
     * @type {string} npoCode
     * @description 捐贈碼
     * @member
     */
    this.npoCode = '';
    /**
     * @type {Number} carrierType
     * @description 載具類別
     * @member
     */
    this.carrierType = null;
    /**
     * @type {string} carrierNum
     * @description 載具編號
     * @member
     */
    this.carrierNum = '';
    /**
     * @type {Number} amount
     * @description 發票金額
     * @member
     */
    this.amount = null;
    /**
     * @type {Number} afterAllowanceAmount
     * @description 折讓後剩餘金額
     * @member
     */
    this.afterAllowanceAmount = null;
    /**
     * @type {string} identifier
     * @description (買方)統一編號
     * @member
     */
    this.identifier = '';
    /**
     * @type {string} note
     * @description 備註
     * @member
     */
    this.note = '';
    /**
     * @type {EInvoiceCustomerObject} customer
     * @description 買方資料
     * @member
     */
    this.customer = new EInvoiceCustomerObject();
    /**
     * @type {EInvoiceItemObject[]} items
     * @description 商品列表
     * @member
     */
    this.items = [];
    /**
     * @type {string} invalidReason
     * @description 作廢原因
     * @member
     */
    this.invalidReason = '';
    /**
     * @type {string} voidReason
     * @description 註銷原因
     * @member
     */
    this.voidReason = '';
    /**
     * @type {Number} taxRate
     * @description 稅率
     * @member
     */
    this.taxRate = null;
    /**
     * @type {Number} taxAmount
     * @description 稅金
     * @member
     */
    this.taxAmount = null;
    /**
     * @type {Boolean} uploadStatus
     * @description 上傳狀態
     * @member
     */
    this.uploadStatus = null;
    /**
     * @type {Date} uploadDate
     * @description 上傳時間
     * @member
     */
    this.uploadDate = '';
    /**
     * @type {Number} uploadGovStatus
     * @description 上傳後接收狀態
     * @member
     */
    this.uploadGovStatus = null;
    /**
     * @type {Number} prize
     * @description 中獎旗標
     * @member
     */
    this.prize = null;
    /**
     * @type {Number} winningPrize
     * @description 中獎獎別
     * @member
     */
    this.winningPrize = null;
  }

  bind(data) {
    super.bind(data, this);
    this.customer = data.customer ? new EInvoiceCustomerObject().bind(data.customer) : new EInvoiceCustomerObject();
    this.items = CustomValidator.nonEmptyArray(data.items) ? data.items.map((item) => (new EInvoiceItemObject().bind(item).withTaxType(this.taxType))) : [];
    return this;
  }

  bindDB(data) {
    super.bind(data, this);
    this.companyId = this.companyId.toString();
    this.caseId = this.caseId.toString();
    this.creator = this.creator ? this.creator.toString() : '';
    this.modifier = this.modifier ? this.modifier.toString() : '';
    return this;
  }

  withSpecialTaxType() {
    switch (this.taxType) {
      case taxTypeCodes.taxable:
      case taxTypeCodes.zeroTaxRate:
      case taxTypeCodes.mixture:
        this.specialTaxType = specialTaxTypeCodes.type0;
        break;
      case taxTypeCodes.taxFree:
        this.specialTaxType = specialTaxTypeCodes.type8;
        break;
      default:
        break;
    }
    return this;
  }
}

module.exports = EInvoiceEntity;
