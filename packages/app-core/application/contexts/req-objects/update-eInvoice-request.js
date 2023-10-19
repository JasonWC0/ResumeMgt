/* eslint-disable object-curly-newline */
/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-eInvoice-request.js
 * Project: @erpv3/app-core
 * File Created: 2023-03-08 05:13:29 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { models, codes } = require('@erpv3/app-common');
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, EInvoiceCustomerObject, EInvoiceItemObject } = require('../../../domain');
const { invTypeCodes, taxTypeCodes, specialTaxTypeCodes, clearanceMarkCodes, carrierTypeCodes } = require('../../../domain/enums/eInvoice-codes');

/**
* @class
* @classdesc inherit BaseBundle
*/
class UpdateEInvoiceRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {String} invType
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
     * @description 商品單價是否含稅 Default:true
     * @member
     */
    this.vat = true;
    /**
     * @type {Number} amount
     * @description 發票金額(含稅)
     * @member
     */
    this.amount = null;
    /**
     * @type {String} identifier
     * @description (買方)統一編號
     * @member
     */
    this.identifier = '';
    /**
     * @type {String} note
     * @description 備註
     * @member
     */
    this.note = '';
    /**
     * @type {Boolean} print
     * @description 列印
     * @member
     */
    this.print = false;
    /**
     * @type {Object} customer
     * @description 買方資料
     * @member
     */
    this.customer = new EInvoiceCustomerObject();
    /**
     * @type {Object[]} items
     * @description 商品列表
     * @member
     */
    this.items = [];
    /**
     * @type {Boolean} donation
     * @description 捐贈與否
     * @member
     */
    this.donation = null;
    /**
     * @type {String} npoCode
     * @description 捐贈碼
     * @member
     */
    this.npoCode = '';
    /**
     * @type {Number} carrierType
     * @description 載具類別
     * @member
     */
    this.carrierType = carrierTypeCodes.none;
    /**
     * @type {String} carrierNum
     * @description 載具編號
     * @member
     */
    this.carrierNum = '';
  }

  bind(data) {
    super.bind(data, this);
    this.customer = data?.customer ? new EInvoiceCustomerObject().bind(data.customer) : new EInvoiceCustomerObject();
    this.items = CustomValidator.nonEmptyArray(data?.items) ? data.items.map((i) => (new EInvoiceItemObject().bind(i))) : [];
    return this;
  }

  baseCheckRequired() {
    new CustomValidator()
      .checkThrows(this.invType,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_EINVOICE_INV_TYPE_IS_EMPTY },
        { fn: (val) => Object.values(invTypeCodes).includes(val), m: coreErrorCodes.ERR_EINVOICE_INV_TYPE_NOT_EXIST })
      .checkThrows(this.taxType,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_EINVOICE_TAX_TYPE_IS_EMPTY },
        { fn: (val) => Object.values(taxTypeCodes).includes(val), m: coreErrorCodes.ERR_EINVOICE_TAX_TYPE_NOT_EXIST })
      .checkThrows(this.vat,
        { s: CustomValidator.strategies.IS_BOOL, m: coreErrorCodes.ERR_EINVOICE_VAT_WRONG_FORMAT })
      .checkThrows(this.amount,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_EINVOICE_AMOUNT_WRONG_FORMAT });

    this.items = this.items.map((item) => item.checkRequired(this.taxType));
    if (this.identifier) {
      new CustomValidator()
        .checkThrows(this.identifier,
          { fn: (val) => CustomRegex.companyIdentifier(val, codes.regionCodes.taiwan), m: coreErrorCodes.ERR_CUSTOMER_IDENTIFIER_WRONG_FORMAT });
    }

    // 當taxType=2時，通關類別為必填
    if (CustomValidator.isEqual(taxTypeCodes.zeroTaxRate, this.taxType)) {
      new CustomValidator()
        .checkThrows(this.clearanceMark,
          { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_CLEARANCE_MARK_IS_EMPTY },
          { fn: (val) => Object.values(clearanceMarkCodes).includes(val), m: coreErrorCodes.ERR_CLEARANCE_MARK_NOT_EXIST });
    }
    // 當taxType=4時，特種稅額類別為必填
    if (CustomValidator.isEqual(taxTypeCodes.spTaxable, this.taxType)) {
      new CustomValidator()
        .checkThrows(this.specialTaxType,
          { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_EINVOICE_SPECIAL_TAX_TYPE_IS_EMPTY },
          { fn: (val) => (Object.values(specialTaxTypeCodes).includes(val) && !CustomValidator.isEqual(specialTaxTypeCodes.type0, this.specialTaxType)), m: coreErrorCodes.ERR_EINVOICE_SPECIAL_TAX_TYPE_NOT_EXIST });
    }
    // 當taxType=9(混合)時，商品只能(應稅+零稅率)or(應稅+免稅)，不可(零稅率+免稅)並存
    if (CustomValidator.isEqual(taxTypeCodes.mixture, this.taxType)) {
      const itemsTax = this.items.map((item) => item.taxType);
      if (itemsTax.includes(taxTypeCodes.zeroTaxRate) && itemsTax.includes(taxTypeCodes.taxFree)) {
        throw new models.CustomError(coreErrorCodes.ERR_EINVOICE_ITEM_TAX_TYPE_WRONG_VALUE);
      }
    }
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .checkThrows(this.donation,
        { s: CustomValidator.strategies.IS_BOOL, m: coreErrorCodes.ERR_EINVOICE_DONATION_WRONG_FORMAT })
      .checkThrows(this.carrierType,
        { fn: (val) => Object.values(carrierTypeCodes).includes(val), m: coreErrorCodes.ERR_EINVOICE_CARRIER_TYPE_NOT_EXIST })
      .checkThrows(this.print,
        { s: CustomValidator.strategies.IS_BOOL, m: coreErrorCodes.ERR_EINVOICE_PRINT_WRONG_FORMAT });

    // 確認捐贈碼
    if (this.donation) {
      new CustomValidator()
        .checkThrows(this.npoCode,
          { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_EINVOICE_DONATE_NPO_CODE_IS_EMPTY },
          { fn: (val) => CustomRegex.npoCode(val, codes.regionCodes.taiwan), m: coreErrorCodes.ERR_EINVOICE_DONATE_NPO_CODE_WRONG_FORMAT });
    }
    // 確認載具號碼
    if ([carrierTypeCodes.citizenDigiCertBarcode, carrierTypeCodes.cellPhoneBarcode].includes(this.carrierType)) {
      new CustomValidator().nonEmptyStringThrows(this.carrierNum, coreErrorCodes.ERR_EINVOICE_CARRIER_NUM_IS_EMPTY);
      if (CustomValidator.isEqual(carrierTypeCodes.citizenDigiCertBarcode, this.carrierType)) {
        new CustomValidator()
          .checkThrows(this.carrierNum,
            { fn: (val) => CustomRegex.citizenDigiCertBarcode(val, codes.regionCodes.taiwan), m: coreErrorCodes.ERR_EINVOICE_CARRIER_NUM_WRONG_FORMAT });
      } else if (CustomValidator.isEqual(carrierTypeCodes.cellPhoneBarcode, this.carrierType)) {
        new CustomValidator()
          .checkThrows(this.carrierNum,
            { fn: (val) => CustomRegex.cellPhoneBarcode(val, codes.regionCodes.taiwan), m: coreErrorCodes.ERR_EINVOICE_CARRIER_NUM_WRONG_FORMAT });
      }
    }
    // 確認列印
    if (this.donation) {
      new CustomValidator().checkThrows(this.print, { fn: (val) => CustomValidator.isEqual(val, false), m: coreErrorCodes.ERR_EINVOICE_PRINT_WRONG_VALUE });
    } else if (CustomValidator.nonEmptyString(this.identifier)) {
      switch (this.carrierType) {
        case null:
        case carrierTypeCodes.none:
          new CustomValidator().checkThrows(this.print, { fn: (val) => CustomValidator.isEqual(val, true), m: coreErrorCodes.ERR_EINVOICE_PRINT_WRONG_VALUE });
          break;
        case carrierTypeCodes.service:
        case carrierTypeCodes.citizenDigiCertBarcode:
          new CustomValidator().checkThrows(this.print, { fn: (val) => CustomValidator.isEqual(val, false), m: coreErrorCodes.ERR_EINVOICE_PRINT_WRONG_VALUE });
          break;
        default:
          break;
      }
    }
    // 確認客戶
    this.customer = this.customer.checkRequired();
    return this;
  }
}

module.exports = UpdateEInvoiceRequest;
