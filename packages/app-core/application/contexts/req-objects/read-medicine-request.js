/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: read-medicine-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-08-10 02:56:08 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class ReadMedicineListRequest extends BaseBundle {
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
     * @type {string} category
     * @description 藥品類型
     * @member
     */
    this.category = null;
    /**
     * @type {string} drugCode
     * @description 代碼(健保碼)
     * @member
     */
    this.drugCode = '';
    /**
     * @type {string} atcCode
     * @description ATC碼
     * @member
     */
    this.atcCode = '';
    /**
     * @type {string} chineseName
     * @description 中文藥名
     * @member
     */
    this.chineseName = '';
    /**
     * @type {string} englishName
     * @description 英文藥名
     * @member
     */
    this.englishName = '';
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
    this.order = 'englishName';
  }

  bind(data) {
    super.bind(data, this);
    if (this.skip) { this.skip = Number(this.skip); }
    if (this.limit) { this.limit = Number(this.limit); }
    if (this.category) { this.category = Number(this.category); }
    return this;
  }

  setOrder(_categoryDB) {
    // sharedDB cannot order by category (use default 'englishName')
    if (_categoryDB === 'shared' && this.order.indexOf('category') !== -1) {
      this.order = 'englishName';
    }

    const orderStr = CustomUtils.deepCopy(this.order);
    this.order = {};
    switch (orderStr) {
      case 'category':
      case 'drugCode':
      case 'atcCode':
        this.order[orderStr] = 1;
        break;
      case '-category':
      case '-drugCode':
      case '-atcCode':
      case '-englishName':
        this.order[orderStr.slice(1)] = -1;
        break;
      case 'englishName':
      default:
        this.order = { englishName: 1 };
        break;
    }
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .checkThrows(this.skip,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_SKIP_IS_EMPTY })
      .checkThrows(this.limit,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_LIMIT_IS_EMPTY });

    return this;
  }
}

module.exports = ReadMedicineListRequest;
