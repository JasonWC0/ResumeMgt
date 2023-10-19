/**
 * FeaturePath:  Common-Entity--審核歷程
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-review-history-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-10 02:59:24 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const BaseEntity = require('./base-entity');

/**
 * @class
 * @classdesc FormReviewHistoryEntity
 */
class FormReviewHistoryEntity extends BaseEntity {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
     * @type {string} clientDomain
     * @description 資料建立來源
     * @member
     */
    this.clientDomain = '';
    /**
     * @type {string} companyId
     * @description 公司Id
     * @member
     */
    this.companyId = '';
    /**
     * @type {string} category
     * @description 表單主類別
     * @member
     */
    this.category = '';
    /**
     * @type {string} type
     * @description 表單次類別
     * @member
     */
    this.type = '';
    /**
     * @type {string} fid
     * @description 表單結果Id
     * @member
     */
    this.fid = '';
    /**
     * @type {string} submittedAt
     * @description 表單建立時間
     * @member
     */
    this.submittedAt = '';
    /**
     * @type {number} status
     * @description 狀態
     * @member
     */
    this.status = undefined;
    /**
     * @type {string} comment
     * @description 審核意見
     * @member
     */
    this.comment = ' ';
    /**
     * @type {string} content
     * @description 內容/表單名稱
     * @member
     */
    this.content = '';
    /**
     * @type {object} submitter
     * @description 送表單員工
     * @member
     */
    this.submitter = {
      personId: '',
      name: '',
    };
    /**
     * @type {string} fillerName
     * @description 填表人姓名
     * @member
     */
    this.fillerName = '';
  }

  bindDB(data) {
    super.bind(data, this);
    this.companyId = this.companyId.toString();
    this.fid = this.fid.toString();
    this.submitter.personId = this.submitter.personId.toString();
    return this;
  }

  bindSubmitter(submitter) {
    this.submitter = submitter;
    return this;
  }

  withStatus(status) {
    this.status = status;
    return this;
  }

  withClientDomain(domainName) {
    this.clientDomain = domainName;
    return this;
  }
}

module.exports = FormReviewHistoryEntity;
