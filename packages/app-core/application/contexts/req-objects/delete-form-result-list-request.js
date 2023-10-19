/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: delete-form-result-list-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-10 06:38:37 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class DeleteFormResultListRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
    * @type {Array} ids
    * @description 刪除fromResult ids
    * @member
    */
    this.ids = [];
  }

  bind(data = {}) {
    super.bind(data, this);
    return this;
  }

  /**
  * @function
  * @description 確認是否有空白、格式
  */
  checkRequired() {
    new CustomValidator()
      .checkThrows(this.ids,
        { s: CustomValidator.strategies.NON_EMPTY_ARRAY, m: coreErrorCodes.ERR_FROM_RESULT_IDS_IS_EMPTY });
    return this;
  }
}

module.exports = DeleteFormResultListRequest;
