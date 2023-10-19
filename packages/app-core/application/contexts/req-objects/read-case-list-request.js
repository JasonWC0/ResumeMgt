/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const {
  coreErrorCodes,
  caseServiceStatusCodes,
} = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class ReadCaseListRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} serviceCategory
     * @description 服務類型
     * @member
     */
    this.serviceCategory = null;
    /**
     * @type {string} caseNumber
     * @description 案號
     * @member
     */
    this.caseNumber = null;
    /**
     * @type {string} name
     * @description 姓名
     * @member
     */
    this.name = null;
    /**
     * @type {Number} status
     * @description 個案狀態
     * @member
     */
    this.status = null;
    /**
     * @type {Number} skip
     * @description 略過數量
     * @member
     */
    this.skip = 0;
    /**
    * @type {Number} limit
    * @description 查詢數量
    * @member
    */
    this.limit = 50;
    /**
     * @type {String} order
     * @description 排序
     * @member
     */
    this.sort = '-createdAt';
    /**
     * @type {String} detail
     * @description 較多資訊欄位
     * @member
     */
    this.detail = '';
  }

  bind(data) {
    super.bind(data, this);
    this.detail = CustomValidator.nonEmptyString(data.detail) ? this.detail.split(',') : '';
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.serviceCategory, coreErrorCodes.ERR_SERVICE_CATEGORY_WRONG_VALUE);
    if (this.status) {
      new CustomValidator().checkThrows(this.status,
        { fn: (val) => !Number.isNaN(Number(val)), m: coreErrorCodes.ERR_CASE_SERVICE_STATUS_WRONG_VALUE });
      this.status = parseInt(this.status, 10);
      new CustomValidator().checkThrows(this.status, {
        m: coreErrorCodes.ERR_CASE_SERVICE_STATUS_WRONG_VALUE,
        fn: (val) => Object.values(caseServiceStatusCodes).includes(val),
      });
    }
    if (this.skip) {
      new CustomValidator().checkThrows(this.skip,
        { fn: (val) => !Number.isNaN(Number(val)), m: coreErrorCodes.ERR_SKIP_WRONG_FORMAT });
      this.skip = parseInt(this.skip, 10);
    }
    if (this.limit) {
      new CustomValidator().checkThrows(this.limit,
        { fn: (val) => !Number.isNaN(Number(val)), m: coreErrorCodes.ERR_LIMIT_WRONG_FORMAT });
      this.limit = parseInt(this.limit, 10);
    }
    return this;
  }
}

module.exports = ReadCaseListRequest;
