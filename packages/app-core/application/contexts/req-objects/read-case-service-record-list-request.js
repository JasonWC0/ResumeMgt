/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: read-case-service-record-list-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-11-03 01:34:07 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex, CustomUtils } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, companyServiceCodes } = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class ReadCaseServiceRecordListRequest extends BaseBundle {
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
     * @type {string} service
     * @description 服務類型
     * @member
     */
    this.service = '';
    /**
     * @type {string} startDate
     * @description 開始日期
     * @member
     */
    this.startDate = null;
    /**
     * @type {string} endDate
     * @description 結束日期
     * @member
     */
    this.endDate = null;
    /**
     * @type {boolean} total
     * @description 是否僅取得數量
     * @member
     */
    this.total = false;
  }

  bind(data) {
    super.bind(data, this);
    this.total = CustomUtils.convertBoolean(data.total, true);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.caseId, coreErrorCodes.ERR_CASE_ID_IS_EMPTY)
      .checkThrows(this.service,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_CASE_SERVICE_IS_EMPTY },
        { fn: (val) => Object.values(companyServiceCodes).includes(val.toUpperCase()), m: coreErrorCodes.ERR_SERVICE_WRONG_VALUE })
      .checkThrows(this.startDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_START_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_START_DATE_WRONG_FORMAT });

    if (CustomValidator.nonEmptyString(this.endDate)) {
      new CustomValidator()
        .checkThrows(this.endDate,
          { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_END_DATE_WRONG_FORMAT });
    }
    return this;
  }
}

module.exports = ReadCaseServiceRecordListRequest;
