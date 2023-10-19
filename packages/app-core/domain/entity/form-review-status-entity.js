/**
 * FeaturePath:  Common-Entity--審核狀態
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-review-status-entity.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-10 02:59:10 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { CustomValidator } = require('@erpv3/app-common').tools;
const BaseEntity = require('./base-entity');

/**
* @class
* @classdesc FormReviewStatusEntity
*/
class FormReviewStatusEntity extends BaseEntity {
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
     * @description 主目錄
     * @member
     */
    this.category = '';
    /**
     * @type {String} category
     * @description 次目錄
     * @member
     */
    this.type = '';
    /**
     * @type {string} fid
     * @description 表單結果Id ex: FormResultId, CarePlanId, ...
     * @member
     */
    this.fid = '';
    /**
     * @type {string} fillerName
     * @description 填表人姓名
     * @member
     */
    this.fillerName = '';
    /**
     * @type {string} submittedAt
     * @description 表單建立時間
     * @member
     */
    this.submittedAt = '';
    /**
     * @type {string} status
     * @description 狀態
     * @member
     */
    this.status = 1;
    /**
     * @type {string} comment
     * @description 審核意見
     * @member
     */
    this.comment = '';
    /**
     * @type {array} reviewers
     * @description 審核者
     * @member
     */
    this.reviewers = [];
    /**
     * @type {array} reviewRoles
     * @description 審核角色
     * @member
     */
    this.reviewRoles = [];
    /**
     * @type {number} layerAt
     * @description 第幾層審核者
     * @member
     */
    this.layerAt = null;
    /**
     * @type {array} nowReviewer
     * @description 當下的審核者
     * @member
     */
    this.nowReviewer = this.reviewers[this.layerAt];
    this.nowReviewRole = this.reviewRoles[this.layerAt];
    /**
     * @type {string} lastReviewerName
     * @description 最後一位審核者姓名
     * @member
     */
    this.lastReviewerName = '';
    /**
     * @type {string} content
     * @description 內容/表單名稱
     * @member
     */
    this.content = '';
  }

  bindForm(form, result, caseName) {
    this.clientDomain = form.clientDomain;
    this.companyId = form.companyId;
    this.category = form.category;
    this.type = form.type;
    this.reviewRoles = form.reviewRoles;
    this.fid = result.id ? result.id : result.rid;
    this.fillerName = result.filler.name;
    this.submittedAt = result.submittedAt;
    this.content = `${caseName}-${form.name}`;
    return this;
  }

  bindDB(data) {
    super.bind(data, this);
    this.companyId = this.companyId.toString();
    this.fid = this.fid.toString();
    if (CustomValidator.nonEmptyArray(this.reviewers)) {
      this.reviewers.forEach((value) => value.toString());
    }
    if (CustomValidator.nonEmptyObject(this.nowReviewer)) {
      this.nowReviewer = this.nowReviewer.toString();
    }
    return this;
  }

  genReviewer() {
    if ((typeof this.layerAt === 'number') && this.layerAt >= 0) {
      this.nowReviewer = this.reviewers[this.layerAt];
      this.nowReviewRole = this.reviewRoles[this.layerAt];
    } else {
      this.nowReviewer = null;
      this.nowReviewRole = null;
    }
    return this;
  }

  withStatus(status) {
    this.status = status;
    return this;
  }

  withLayerAt(layerAt = null) {
    this.layerAt = layerAt;
    return this;
  }

  withLastReviewerName(lastReviewerName = '') {
    this.lastReviewerName = lastReviewerName;
    return this;
  }

  withComment(comment = '') {
    this.comment = comment;
    return this;
  }

  withClientDomain(domainName) {
    this.clientDomain = domainName;
    return this;
  }

  toView() {
    return {
      sid: this.id,
      fid: this.fid,
      category: this.category,
      type: this.type,
      reviewRoles: this.reviewRoles,
      reviewers: this.reviewers,
      nowReviewRole: this.nowReviewRole,
      nowReviewer: this.nowReviewer,
      status: this.status,
      comment: this.comment,
      fillerName: this.fillerName,
      lastReviewerName: this.lastReviewerName,
      vn: this.__vn,
    };
  }
}

module.exports = FormReviewStatusEntity;
