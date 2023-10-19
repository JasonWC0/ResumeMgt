/**
 * FeaturePath: Common-Entity--電子發票顧客物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: eInvoice-customer-object.js
 * Project: @erpv3/app-core
 * File Created: 2023-03-07 02:46:27 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const { models } = require('@erpv3/app-common');
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const coreErrorCodes = require('../enums/error-codes');

class eInvoiceCustomerObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {String} name
     * @description 名稱
     * @member {String}
     */
    this.name = '';
    /**
     * @type {String} address
     * @description 地址
     * @member {String}
     */
    this.address = false;
    /**
     * @type {String} mobile
     * @description 手機
     * @member {String}
     */
    this.mobile = false;
    /**
     * @type {String} email
     * @description 電子信箱
     * @member {String}
     */
    this.email = false;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.name, coreErrorCodes.ERR_CUSTOMER_NAME_IS_EMPTY)
      .nonEmptyStringThrows(this.address, coreErrorCodes.ERR_CUSTOMER_ADDRESS_IS_EMPTY);
    if (!CustomValidator.nonEmptyString(this.mobile) && !CustomValidator.nonEmptyString(this.email)) {
      throw new models.CustomError(coreErrorCodes.ERR_CUSTOMER_MOBILE_EMAIL_BOTH_EMPTY);
    }
    if (CustomValidator.nonEmptyString(this.mobile)) {
      new CustomValidator()
        .checkThrows(this.mobile,
          { fn: (val) => CustomRegex.cellPhone(val), m: coreErrorCodes.ERR_CUSTOMER_MOBILE_WRONG_FORMAT });
    }
    if (CustomValidator.nonEmptyString(this.email)) {
      new CustomValidator()
        .checkThrows(this.email,
          { fn: (val) => CustomRegex.email(val), m: coreErrorCodes.ERR_PERSON_EMAIL_WRONG_VALUE });
    }
    return this;
  }
}

module.exports = eInvoiceCustomerObject;
