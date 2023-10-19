/**
 * FeaturePath: Common-Entity--報表
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: report-table-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-09-05 07:29:27 pm
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const BaseEntity = require('./base-entity');
const FileObject = require('../value-objects/file-object');
const ReportRequestInfoObject = require('../value-objects/report-request-info-object');

class ReportTableEntity extends BaseEntity {
  constructor() {
    super();
    /**
     * @type {String} type
     * @description 報表類型
     * @member
     */
    this.type = '';
    /**
     * @type {String} companyId
     * @description 公司id
     * @member
     */
    this.companyId = '';
    /**
     * @type {Number} year
     * @description 報表年份
     * @member
     */
    this.year = null;
    /**
     * @type {Number} month
     * @description 報表月份
     * @member
     */
    this.month = null;
    /**
     * @type {Date} date
     * @description 報表日期
     * @member
     */
    this.date = null;
    /**
     * @type {String} startDate
     * @description 報表起始時間
     * @member
     */
    this.startDate = '';
    /**
     * @type {String} endDate
     * @description 報表結束時間
     * @member
     */
    this.endDate = '';
    /**
     * @type {String} serviceCode
     * @description 服務代碼
     * @member
     */
    this.serviceCode = '';
    /**
     * @type {Number} produceTime
     * @description 檔案產生花費時間 (sec.)
     * @member
     */
    this.produceTime = null;
    /**
     * @type {Number} genStatus
     * @description 產出報表狀態
     * @member
     */
    this.genStatus = null;
    /**
     * @type {FileObject} reportFile
     * @description 報表檔案資料(儲存服務)
     * @member
     */
    this.reportFile = new FileObject();
    /**
     * @type {ReportRequestInfoObject} requestInfo
     * @description Request資料
     * @member
     */
    this.requestInfo = new ReportRequestInfoObject();
    /**
     * @type {Boolean} once
     * @description 一次性報表(非分析報表)
     * @member
     */
    this.once = false;
    /**
     * @type {Date} createdAt
     * @description 建立時間
     * @member
     */
    this.createdAt = null;
    /**
     * @type {Date} updatedAt
     * @description 更新時間
     * @member
     */
    this.updatedAt = null;
  }

  bind(data) {
    super.bind(data, this);
    this.reportFile = data.reportFile ? new FileObject().bind(data.reportFile) : new FileObject();
    this.requestInfo = data.requestInfo ? new ReportRequestInfoObject().bind(data.requestInfo) : new ReportRequestInfoObject();
    return this;
  }

  bindDBObjectId(data) {
    this.companyId = data.companyId ? data.companyId.toString() : '';
    return this;
  }

  withOnce(once = false) {
    this.once = once;
    return this;
  }

  withGenStatus(status = null) {
    this.genStatus = status;
    return this;
  }

  withProduceTime(produceTime) {
    this.produceTime = produceTime;
    return this;
  }

  withRequestInfo(reqInfo = new ReportRequestInfoObject()) {
    this.requestInfo = new ReportRequestInfoObject().bind(reqInfo);
    return this;
  }

  withReportFile(fileObj = new FileObject()) {
    this.reportFile = new FileObject().bind(fileObj);
    return this;
  }
}

module.exports = ReportTableEntity;
