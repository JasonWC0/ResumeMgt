/**
 * FeaturePath: Common-Entity--員工到職紀錄
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const BaseEntity = require('./base-entity');
/**
 * @class
 * @classdesc EmploymentHistoryEntity
 */
class EmploymentHistoryEntity extends BaseEntity {
  /**
    * @constructor
    */
  constructor() {
    super();
    /**
     * @type {string} _id
     * @description ObjectId
     * @member
     */
    this._id = '';
    /**
     * @type {string} personId
     * @description 個人ID
     * @member
     */
    this.personId = '';
    /**
     * @type {string} companyId
     * @description 公司ID
     * @member
     */
    this.companyId = '';
    /**
     * @type {Date} date
     * @description 異動日期
     * @member
     */
    this.date = new Date();
    /**
     * @type {employmentStatusHistoryCodes} status
     * @description 異動狀態
     * @member
     */
    this.status = null;
    /**
     * @type {Boolean} valid
     * @description 資料是否有效
     * @member
     */
    this.valid = {};
  }

  withPersonId(personId = '') {
    this.personId = personId;
    return this;
  }

  withCompanyId(company = '') {
    this.companyId = company;
    return this;
  }

  withDate(date = '') {
    this.date = date;
    return this;
  }

  withStatus(status = null) {
    this.status = status;
    return this;
  }

  toView() {
    return {
      id: this.id,
      personId: this.personId,
      companyId: this.companyId,
      date: this.date,
      status: this.status,
      vn: this.__vn,
    };
  }
}

module.exports = EmploymentHistoryEntity;
