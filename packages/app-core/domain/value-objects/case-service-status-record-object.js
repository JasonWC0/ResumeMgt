/**
 * FeaturePath: Common-Entity--個案服務異動歷史紀錄
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
const caseServiceStatusCodes = require('../enums/case-service-status-codes');
const caseClosedReasonCodes = require('../enums/case-closed-reason-codes');

/**
 * @class
 * @classdesc Represents case service status record object
 */
class CaseServiceStatusRecordObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {Date} date
     * @description 日期
     * @member
     */
    this.date = null;
    /**
     * @type {number} status
     * @description 狀態
     * @member
     */
    this.status = null;
    /**
     * @type {number} pendingType
     * @description 暫停類型
     * @member
     */
    this.pendingType = null;
    /**
     * @type {number} reason
     * @description 原因
     * @member
     */
    this.reason = null;
    /**
     * @type {string} memo
     * @description 備註
     * @member
     */
    this.memo = '';
    /**
     * @type {Date} createdAt
     * @description 建立時間
     * @member
     */
    this.createdAt = null;
    /**
     * @type {Date} updateAt
     * @description 異動時間
     * @member
     */
    this.updatedAt = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  bindObjectId(id) {
    this.id = id.toString();
    return this;
  }

  withDate(date) {
    this.date = date;
    return this;
  }

  withStatus(status) {
    this.status = status;
    return this;
  }

  withPendingType(type) {
    if (type && this.status === caseServiceStatusCodes.pending) {
      this.pendingType = type;
    }
    return this;
  }

  genCreatedAt() {
    this.createdAt = new Date();
    return this;
  }

  genUpdatedAt() {
    this.updatedAt = new Date();
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    new CustomValidator()
      .checkThrows(this.date, { m: coreErrorCodes.ERR_DATE_WRONG_FORMAT, s: CustomValidator.strategies.IS_ISODATE })
      .checkThrows(this.createdAt, { m: coreErrorCodes.ERR_DATE_WRONG_FORMAT, s: CustomValidator.strategies.IS_ISODATE })
      .checkThrows(this.updatedAt, { m: coreErrorCodes.ERR_DATE_WRONG_FORMAT, s: CustomValidator.strategies.IS_ISODATE })
      .checkThrows(this.status, {
        m: coreErrorCodes.ERR_CASE_SERVICE_STATUS_WRONG_VALUE,
        fn: (val) => Object.values(caseServiceStatusCodes).includes(val),
      });
    if (this.reason) {
      new CustomValidator()
        .checkThrows(this.reason,
          { fn: (val) => Object.values(caseClosedReasonCodes).includes(val), m: coreErrorCodes.ERR_CASE_CLOSED_REASON_WRONG_VALUE });
    }
    return this;
  }

  /**
  * @method
  * @description Return formated info
  * @returns {Object}
  */
  responseInfo() {
    return {
      date: this.date,
      status: this.status,
      reason: this.reason,
      memo: this.memo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = CaseServiceStatusRecordObject;
