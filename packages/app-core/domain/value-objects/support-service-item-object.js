/**
 * FeaturePath: Common-Entity--支援服務項目物件
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

class SupportServiceItemObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} itemId
     * @description 服務項目Id
     * @member {string}
     */
    this.itemId = '';
    /**
     * @type {string} itemType
     * @description 服務項目類別, ex: A,B,C,D,G
     * @member {string}
     */
    this.itemType = '';
    /**
     * @type {number} amount
     * @description 服務數量
     * @member {number}
     */
    this.amount = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .checkThrows(this.itemId,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_SUPPORT_SERVICE_ITEM_ID_IS_EMPTY })
      .checkThrows(this.amount,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_SUPPORT_SERVICE_ITEM_AMOUNT_WRONG_FORMAT });
    return this;
  }
}

module.exports = SupportServiceItemObject;
