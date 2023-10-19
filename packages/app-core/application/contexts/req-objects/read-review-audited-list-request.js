/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: read-review-audited-list-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-22 04:55:34 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models } = require('@erpv3/app-common');
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class ReadReviewAuditedListRequest extends BaseBundle {
  /**
* @constructor
*/
  constructor() {
    super();
    /**
     * @type {String} personId
     * @description 人員Id
     * @member
     */
    this.personId = '';
    /**
     * @type {string} companyId
     * @description 公司Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} from
     * @description 申請日期開始區間
     * @member
     */
    this.f = '';
    /**
     * @type {string} end
     * @description 申請日期結束區間
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
     * @type {number} skip
     * @description 分頁用，略過筆數
     * @member
     */
    this.skip = '';
    /**
     * @type {number} limit
     * @description 分頁用，每次取出筆數
     * @member
     */
    this.limit = '';
  }

  bind(data) {
    super.bind(data, this);
    this.skip = CustomValidator.nonEmptyString(this.skip) ? Number(this.skip) : null;
    this.limit = CustomValidator.nonEmptyString(this.limit) ? Number(this.limit) : null;
    return this;
  }

  /**
* @function
* @description 確認是否有空白
*/
  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.personId, coreErrorCodes.ERR_PERSON_ID_IS_EMPTY)
      .checkThrows(this.skip,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_SKIP_IS_EMPTY },
        { fn: (val) => !Number.isNaN(val), m: coreErrorCodes.ERR_SKIP_IS_EMPTY })
      .checkThrows(this.limit,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_LIMIT_IS_EMPTY },
        { fn: (val) => !Number.isNaN(val), m: coreErrorCodes.ERR_SKIP_IS_EMPTY });

    if (CustomValidator.nonEmptyString(this.f)) {
      if (!CustomRegex.dateFormat(this.f)) {
        throw new models.CustomError(coreErrorCodes.ERR_START_DATE_WRONG_FORMAT);
      }
    }
    if (CustomValidator.nonEmptyString(this.e)) {
      if (!CustomRegex.dateFormat(this.e)) {
        throw new models.CustomError(coreErrorCodes.ERR_END_DATE_WRONG_FORMAT);
      }
    }
    return this;
  }
}
module.exports = ReadReviewAuditedListRequest;
