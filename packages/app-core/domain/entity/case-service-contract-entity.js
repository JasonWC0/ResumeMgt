/**
 * FeaturePath: Common-Entity--個案合約
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-service-contract-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-12-05 11:49:04 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */
const BaseEntity = require('./base-entity');
const FileObject = require('../value-objects/file-object');

class CaseServiceContractEntity extends BaseEntity {
  constructor() {
    super();
    /**
     * @type {string} clientDomain
     * @description 資料建立來源
     * @member
     */
    this.clientDomain = '';
    /**
     * @type {String} companyId
     * @description 公司id
     * @member
     */
    this.companyId = '';
    /**
     * @type {String} caseId
     * @description 個案id
     * @member
     */
    this.caseId = '';
    /**
     * @type {String} service
     * @description 服務類型
     * @member
     */
    this.service = '';
    /**
     * @type {String} principal
     * @description 委託人姓名
     * @member
     */
    this.principal = '';
    /**
     * @type {String} startDate
     * @description 合約起始日
     * @member
     */
    this.startDate = '';
    /**
     * @type {String} endDate
     * @description 合約結束日
     * @member
     */
    this.endDate = '';
    /**
     * @type {FileObject} file
     * @description 合約檔案
     * @member
     */
    this.file = new FileObject();
  }

  bind(data) {
    super.bind(data);
    this.file = data.file ? new FileObject().bind(data.file) : null;
    return this;
  }

  bindClientDomain(clientDomain) {
    this.clientDomain = clientDomain;
    return this;
  }

  bindDB(data) {
    super.bind(data, this);
    this.companyId = this.companyId.toString();
    this.caseId = this.caseId.toString();
    return this;
  }

  toView() {
    return {
      companyId: this.companyId,
      service: this.service,
      caseId: this.caseId,
      principal: this.principal,
      startDate: this.startDate,
      endDate: this.endDate,
      file: {
        id: this.file?.id,
        fileName: this.file?.fileName,
        publicUrl: this.file?.publicUrl,
        updatedAt: this.file?.updatedAt,
        mimeType: this.file?.mimeType,
      },
      vn: this.__vn,
    };
  }
}

module.exports = CaseServiceContractEntity;
