/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: read-review-status-list-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-05-17 04:41:45 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class ReadReviewStatusListRequest extends BaseBundle {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
   * @type {String} companyId
   * @description 公司Id
   * @member
   */
    this.companyId = '';
    /**
   * @type {string} from
   * @description submittedAt日期開始區間
   * @member
   */
    this.f = '';
    /**
   * @type {string} end
   * @description submittedAt日期結束區間
   * @member
   */
    this.e = '';
    /**
   * @type {number} c
   * @description 主類別
   * @member
   */
    this.c = '';
    /**
   * @type {string} t
   * @description 次類別
   * @member
   */
    this.t = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
 * @function
 * @description 確認是否有空白
 */
  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .checkThrows(this.f,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_START_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT })
      .checkThrows(this.e,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_END_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT })
      .checkThrows(this.c,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_FORM_CATEGORY_IS_EMPTY });

    return this;
  }
}
module.exports = ReadReviewStatusListRequest;
