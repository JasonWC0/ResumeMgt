/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: read-review-history-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-22 03:32:14 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class ReadReviewHistoryRequest extends BaseBundle {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
     * @type {string} c
     * @description category 表單主類別
     * @member
     */
    this.c = '';
    /**
     * @type {string} t
     * @description type 表單次類別
     * @member
     */
    this.t = '';
    /**
    * @type {string} id
    * @description 表單Id
    * @member
    */
    this.id = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.c, coreErrorCodes.ERR_FORM_CATEGORY_IS_EMPTY)
      .nonEmptyStringThrows(this.t, coreErrorCodes.ERR_FORM_TYPE_IS_EMPTY)
      .nonEmptyStringThrows(this.id, coreErrorCodes.ERR_FID_IS_EMPTY);

    return this;
  }
}

module.exports = ReadReviewHistoryRequest;
