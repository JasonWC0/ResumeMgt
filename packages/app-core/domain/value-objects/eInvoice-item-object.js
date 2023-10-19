/**
 * FeaturePath: Common-Entity--電子發票商品物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: eInvoice-item-object.js
 * Project: @erpv3/app-core
 * File Created: 2023-03-07 02:46:44 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { taxTypeCodes } = require('../enums/eInvoice-codes');
const coreErrorCodes = require('../enums/error-codes');

class eInvoiceItemObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {String} name
     * @description 名稱
     * @member {String}
     */
    this.name = '';
    /**
     * @type {Number} count
     * @description 數量
     * @member {Number}
     */
    this.count = null;
    /**
     * @type {String} word
     * @description 單位
     * @member {String}
     */
    this.word = '';
    /**
     * @type {Number} price
     * @description 單價
     * @member {Number}
     */
    this.price = null;
    /**
     * @type {Number} taxType
     * @description 商品課稅別
     * @member {Number}
     */
    this.taxType = null;
    /**
     * @type {Number} amount
     * @description 合計
     * @member {Number}
     */
    this.amount = null;
    /**
     * @type {String} note
     * @description 備註
     * @member {String}
     */
    this.note = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
   * 填寫商品課稅類別
   * @param {Number} subTaxType 電子發票課稅類別
   * @returns {eInvoiceItemObject}
   */
  withTaxType(subTaxType) {
    // 一般: 發票課稅別 = 商品課稅別
    const sameTaxType = [taxTypeCodes.taxable, taxTypeCodes.zeroTaxRate, taxTypeCodes.taxFree, taxTypeCodes.spTaxable];
    if (sameTaxType.includes(subTaxType)) {
      this.taxType = subTaxType;
    }
    return this;
  }

  /**
   * 檢查必填
   * @param {Number} subTaxType 電子發票課稅類別
   * @returns {eInvoiceItemObject}
   */
  checkRequired(subTaxType) {
    new CustomValidator()
      .nonEmptyStringThrows(this.name, coreErrorCodes.ERR_EINVOICE_ITEM_NAME_IS_EMPTY)
      .checkThrows(this.count,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_EINVOICE_ITEM_COUNT_WRONG_FORMAT })
      .nonEmptyStringThrows(this.word, coreErrorCodes.ERR_EINVOICE_ITEM_WORD_IS_EMPTY)
      .checkThrows(this.price,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_EINVOICE_ITEM_PRICE_WRONG_FORMAT })
      .checkThrows(this.amount,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_EINVOICE_ITEM_AMOUNT_WRONG_FORMAT });

    // 混合課稅別，必填[應稅, 零稅率, 免稅]
    if (CustomValidator.isEqual(taxTypeCodes.mixture, subTaxType)) {
      new CustomValidator()
        .checkThrows(this.taxType,
          { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_EINVOICE_ITEM_TAX_TYPE_IS_EMPTY },
          { fn: (val) => [taxTypeCodes.taxable, taxTypeCodes.zeroTaxRate, taxTypeCodes.taxFree].includes(val), m: coreErrorCodes.ERR_EINVOICE_ITEM_TAX_TYPE_NOT_EXIST });
    }

    return this;
  }
}

module.exports = eInvoiceItemObject;
