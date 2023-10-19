/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: read-review-pending-list-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-22 03:47:01 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class ReadReviewPendingListRequest extends BaseBundle {
  /**
* @constructor
*/
  constructor() {
    super();
    /**
     * @type {string} personId
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
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.personId, coreErrorCodes.ERR_PERSON_ID_IS_EMPTY);

    return this;
  }
}

module.exports = ReadReviewPendingListRequest;
