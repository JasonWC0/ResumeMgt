/**
 * FeaturePath: Common-Entity--照顧及專業服務支付金額物件
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

class PaymentObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {number} quota
     * @description 給付額度(元)
     * @member {number}
     */
    this.quota = null;
    /**
     * @type {number} subsidy
     * @description 補助金額(元)
     * @member {number}
     */
    this.subsidy = null;
    /**
     * @type {number} copayment
     * @description 民眾部份負擔(元)
     * @member {number}
     */
    this.copayment = null;
    /**
     * @type {number} excessOwnExpense
     * @description 超額自費(元)
     * @member {number}
     */
    this.excessOwnExpense = null;
  }

  bindHtml(data) {
    this.quota = data.quota;
    this.subsidy = data.allowance;
    this.copayment = data.pays;
    return this;
  }

  bindBC(data) {
    super.bind(data, this);
    return this;
  }

  bindG(data) {
    super.bind(data, this);
    delete this.excessOwnExpense;
    return this;
  }

  bindS(data) {
    super.bind(data, this);
    delete this.excessOwnExpense;
    return this;
  }

  checkRequired() {
    if (this.quota) {
      CustomValidator.isNumber(this.quota, coreErrorCodes.ERR_PAYMENT_QUOTA_WRONG_FORMAT);
    }
    if (this.subsidy) {
      CustomValidator.isNumber(this.subsidy, coreErrorCodes.ERR_PAYMENT_SUBSIDY_WRONG_FORMAT);
    }
    if (this.copayment) {
      CustomValidator.isNumber(this.copayment, coreErrorCodes.ERR_PAYMENT_COPAYMENT_WRONG_FORMAT);
    }
    if (this.excessOwnExpense) {
      CustomValidator.isNumber(this.excessOwnExpense, coreErrorCodes.ERR_PAYMENT_EXCESS_OWN_EXPENSE_WRONG_FORMAT);
    }
    return this;
  }
}

module.exports = PaymentObject;
