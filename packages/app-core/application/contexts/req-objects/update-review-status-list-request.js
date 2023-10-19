/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-review-status-list-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-27 11:37:44 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class UpdateReviewStatusListRequest extends BaseBundle {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
   * @type {String} sids
   * @description 表單狀態Id列表
   * @member
   */
    this.data = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .checkThrows(this.data,
        { s: CustomValidator.strategies.NON_EMPTY_ARRAY, m: coreErrorCodes.ERR_REVIEW_MULTI_DATA_IS_EMPTY });

    this.data.forEach((value) => {
      CustomValidator.nonEmptyString(value.id, coreErrorCodes.ERR_SID_IS_EMPTY);
      CustomValidator.isNumber(value.vn, coreErrorCodes.ERR_VN_IS_EMPTY);
    });
    return this;
  }
}
module.exports = UpdateReviewStatusListRequest;
