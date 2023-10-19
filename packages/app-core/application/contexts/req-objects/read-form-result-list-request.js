/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: read-form-result-list-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-15 02:43:25 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, formCategoryCodes } = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class ReadFormResultListRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} caseId
     * @description 個案Id
     * @member
     */
    this.caseId = '';
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
     * @type {number} skip
     * @description 分頁用，略過筆數
     * @member
     */
    this.skip = null;
    /**
     * @type {number} limit
     * @description 分頁用，每次取出筆數
     * @member
     */
    this.limit = null;
    /**
     * @type {string} order
     * @description 排列順序
     * @member
     */
    this.order = '-fillDate';
    /**
     * @type {boolean} detail
     * @description 詳細資料
     * @member
    */
    this.detail = false;
    /**
     * @type {string} pick
     * @description 提取result指定欄位的資料
     * @member
    */
    this.pick = '';
    /**
     * @type {string} f
     * @description 填寫日期開始日期
     * @member
     */
    this.f = '';
    /**
     * @type {string} e
     * @description 填寫日期結束日期
     * @member
     */
    this.e = '';
  }

  bind(data) {
    super.bind(data, this);
    if (this.skip) { this.skip = Number.isNaN(Number(this.skip)) ? null : Number(this.skip); }
    if (this.limit) { this.limit = Number.isNaN(Number(this.limit)) ? null : Number(this.limit); }
    this.detail = CustomUtils.convertBoolean(data.detail, false);
    return this;
  }

  setOrder() {
    if (CustomValidator.isEqual(this.order, 'createdAt')) {
      this.order = { createdAt: 1 };
    } else if (CustomValidator.isEqual(this.order, '-createdAt')) {
      this.order = { createdAt: -1 };
    } else if (CustomValidator.isEqual(this.order, 'fillDate')) {
      this.order = { fillDate: 1, createdAt: -1 };
    } else {
      this.order = { fillDate: -1, createdAt: -1 };
    }
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.t, coreErrorCodes.ERR_FORM_TYPE_IS_EMPTY);

    if (!CustomValidator.isEqual(this.c, formCategoryCodes.event)) {
      new CustomValidator()
        .nonEmptyStringThrows(this.caseId, coreErrorCodes.ERR_FORM_RESULT_CASEID_IS_EMPTY);

      // check skip+limit or f+e
      if (this.skip !== null || this.limit !== null) {
        new CustomValidator()
          .checkThrows(this.skip,
            { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_SKIP_IS_EMPTY })
          .checkThrows(this.limit,
            { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_LIMIT_IS_EMPTY });
      } else {
        new CustomValidator()
          .checkThrows(this.f,
            { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_START_DATE_IS_EMPTY },
            { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT })
          .checkThrows(this.e,
            { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_END_DATE_IS_EMPTY },
            { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT });
      }
    }
    return this;
  }
}

module.exports = ReadFormResultListRequest;
