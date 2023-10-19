/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-form-result-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-17 05:12:59 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, FileObject } = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class UpdateFormResultRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
    * @type {string}
    */
    this.data = '';
    /**
     * @type {string} fillDate
     * @description 填寫日期
     * @member
     */
    this.fillDate = '';
    /**
     * @type {string} fillerId
     * @description 填寫人員工Id
     * @member
     */
    this.fillerId = '';
    /**
     * @type {string} nextEvaluationDate
     * @description 下次評估日期
     * @member
     */
    this.nextEvaluationDate = '';
    /**
     * @type {string} fillerName
     * @description 填寫人員工姓名
     * @member
     */
    this.fillerName = '';
    /**
     * @type {array}} reviewerIds
     * @description 審核者員工Id
     * @member
     */
    this.reviewerIds = [];
    /**
     * @type {object} result
     * @description 表單內容
     * @member
     */
    this.result = {};
    /**
     * @type {array} files
     * @description 檔案列表
     * @member
     */
    this.files = [];
  }

  bind(data = {}) {
    super.bind(data, this);
    this.files = CustomValidator.nonEmptyArray(data.files) ? data.files.map((f) => new FileObject().bind(f)) : [];
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .checkThrows(this.fillDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_FILL_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_FILL_DATE_WRONG_FORMAT })
      .nonEmptyStringThrows(this.fillerId, coreErrorCodes.ERR_FILLER_ID_IS_EMPTY)
      .nonEmptyStringThrows(this.fillerName, coreErrorCodes.ERR_FILLER_NAME_IS_EMPTY);

    if (CustomValidator.nonEmptyString(this.nextEvaluationDate)) {
      new CustomValidator().checkThrows(this.nextEvaluationDate,
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_NEXT_EVALUATION_DATE_WRONG_FORMAT });
    }
    if (CustomValidator.nonEmptyArray(this.files)) {
      this.files.forEach((f) => f.checkRequired());
    }
    return this;
  }
}

module.exports = UpdateFormResultRequest;
