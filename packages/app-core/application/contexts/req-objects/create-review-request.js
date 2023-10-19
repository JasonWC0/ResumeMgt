/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: create-review-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-05-17 02:32:39 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const moment = require('moment');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');
const UpdateReviewRequest = require('./update-review-request');
/**
* @class
* @classdesc inherit UpdateReviewRequest
*/
class CreateReviewRequest extends UpdateReviewRequest {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
    * @type {string} companyId
    * @description 公司Id
    * @member
    */
    this.companyId = '';
    /**
    * @type {string} fid
    * @description 主表單Id
    * @member
    */
    this.fid = '';
    /**
    * @type {string} category
    * @description 主類別
    * @member
    */
    this.category = '';
    /**
    * @type {string} type
    * @description 次類別
    * @member
    */
    this.type = '';
    /**
    * @type {string} content
    * @description 表單內容/標題
    * @member
    */
    this.content = '';
    /**
    * @type {Date} submittedAt
    * @description 送單時間
    * @member
    */
    this.submittedAt = '';
  }

  /**
  * @function
  * @description 確認是否有空白
  */
  checkRequired() {
    super.checkRequired();
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .nonEmptyStringThrows(this.fid, coreErrorCodes.ERR_FID_IS_EMPTY)
      .nonEmptyStringThrows(this.category, coreErrorCodes.ERR_FORM_CATEGORY_IS_EMPTY)
      .nonEmptyStringThrows(this.type, coreErrorCodes.ERR_FORM_TYPE_IS_EMPTY)
      .nonEmptyStringThrows(this.content, coreErrorCodes.ERR_FORM_REVIEW_CONTENT_IS_EMPTY)
      .checkThrows(this.submittedAt,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_FORM_SUBMITTEDAT_IS_EMPTY },
        { fn: (val) => moment(val, moment.ISO_8601).isValid(), m: coreErrorCodes.ERR_FORM_SUBMITTEDAT_WRONG_FORMAT });
    return this;
  }
}

module.exports = CreateReviewRequest;
