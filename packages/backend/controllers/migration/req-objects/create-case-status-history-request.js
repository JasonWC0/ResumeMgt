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
  CaseServiceStatusRecordObject,
} = require('@erpv3/app-core/domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class CreateCaseStatusHistoryRequest extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {string} caseId
     * @description 個案ID
     * @member {string}
     */
    this.caseId = null;
    /**
     * @type {Array<CaseServiceStatusRecordObject>} hc
     * @description 居服異動歷史紀錄
     */
    this.hc = [];
    /**
     * @type {Array<CaseServiceStatusRecordObject>} dc
     * @description 照服異動歷史紀錄
     */
    this.dc = [];
    /**
    * @type {Array<CaseServiceStatusRecordObject>} rc
    * @description 住宿式服務異動歷史紀錄
    */
    this.rc = [];
  }

  bind(data = {}) {
    super.bind(data, this);
    if (CustomValidator.nonEmptyArray(data.hc)) this.hc = data.hc.map((r) => new CaseServiceStatusRecordObject().bind(r));
    if (CustomValidator.nonEmptyArray(data.dc)) this.dc = data.dc.map((r) => new CaseServiceStatusRecordObject().bind(r));
    if (CustomValidator.nonEmptyArray(data.rc)) this.rc = data.rc.map((r) => new CaseServiceStatusRecordObject().bind(r));
    return this;
  }

  checkRequired() {
    new CustomValidator().nonEmptyStringThrows(this.caseId, coreErrorCodes.ERR_CASE_ID_IS_EMPTY);

    this.hc.forEach((r) => r.checkRequired());
    this.dc.forEach((r) => r.checkRequired());
    this.rc.forEach((r) => r.checkRequired());
    return this;
  }
}

module.exports = CreateCaseStatusHistoryRequest;
