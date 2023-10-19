/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-review-status-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-04-25 02:34:58 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

/**
* @class
* @classdesc inherit BaseBundle
*/
class UpdateReviewStatusRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
    * @type {String} comment
    * @description 審核意見
    * @member
    */
    this.comment = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}
module.exports = UpdateReviewStatusRequest;
