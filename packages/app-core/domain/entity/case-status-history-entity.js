/**
 * FeaturePath: Common-Entity--個案服務狀態
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const CaseServiceStatusRecordObject = require('../value-objects/case-service-status-record-object');
const BaseEntity = require('./base-entity');

class CaseStatusHistoryEntity extends BaseEntity {
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
     * @member {Array<CaseServiceStatusRecordObject>}
     */
    this.hc = [];
    /**
     * @type {Array<CaseServiceStatusRecordObject>} dc
     * @description 照服異動歷史紀錄
     * @member {Array<CaseServiceStatusRecordObject>}
     */
    this.dc = [];
    /**
    * @type {Array<CaseServiceStatusRecordObject>} rc
    * @description 住宿式服務異動歷史紀錄
    * @member {Array<CaseServiceStatusRecordObject>}
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

  DBbind(data = {}) {
    super.bind(data, this);
    if (CustomValidator.nonEmptyArray(data.hc)) this.hc = data.hc.map((r) => new CaseServiceStatusRecordObject().bind(r).bindObjectId(r._id));
    if (CustomValidator.nonEmptyArray(data.dc)) this.dc = data.dc.map((r) => new CaseServiceStatusRecordObject().bind(r).bindObjectId(r._id));
    if (CustomValidator.nonEmptyArray(data.rc)) this.rc = data.rc.map((r) => new CaseServiceStatusRecordObject().bind(r).bindObjectId(r._id));
    return this;
  }

  _sort(objList) {
    // descent by date and createdAt
    return objList.sort((a, b) => {
      if (new Date(a.date).getTime() < new Date(b.date).getTime() || new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime()) { return 1; }
      if (new Date(a.date).getTime() > new Date(b.date).getTime() || new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime()) { return -1; }
      return 0;
    });
  }

  sortByDate() {
    if (CustomValidator.nonEmptyArray(this.hc)) { this.hc = this._sort(this.hc); }
    if (CustomValidator.nonEmptyArray(this.dc)) { this.dc = this._sort(this.dc); }
    if (CustomValidator.nonEmptyArray(this.rc)) { this.rc = this._sort(this.rc); }
    return this;
  }
}
module.exports = CaseStatusHistoryEntity;
