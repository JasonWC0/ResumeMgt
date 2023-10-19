/**
 * FeaturePath: Common-Entity--個案
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const BaseEntity = require('./base-entity');
const CaseHcObject = require('../value-objects/case-hc-object');
const CaseDcObject = require('../value-objects/case-dc-object');
const CaseRcObject = require('../value-objects/case-rc-object');
const CaseAcmObject = require('../value-objects/case-acm-object');
const PersonEntity = require('./person-entity');

/**
* @class
* @classdesc BaseEntity
*/
class CaseEntity extends BaseEntity {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
     * @type {string} id
     * @description ObjectId
     * @member
     */
    this.id = '';
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
     * @type {number} bankBillSerialNumber
     * @description 銀行繳費明細表-流水號(宜蘭康活客製)
     * @member
     */
    this.bankBillSerialNumber = null;
    /**
     * @type {string} hc
     * @description 居家式服務
     * @member
     */
    this.hc = null;
    /**
     * @type {string} dc
     * @description 社區式服務
     * @member
     */
    this.dc = null;
    /**
    * @type {string} rc
    * @description 住宿式服務
    * @member
    */
    this.rc = null;
    /**
     * @type {string} acm
     * @description A個管物件
     * @member
     */
    this.acm = null;
    /**
     * @type {string} gh
     * @description 團體家屋
     * @member
     */
    this.gh = null;
  }

  bind(data) {
    super.bind(data);
    if (data.hc) this.hc = new CaseHcObject().bind(data.hc);
    if (data.dc) this.dc = new CaseDcObject().bind(data.dc);
    if (data.rc) this.rc = new CaseRcObject().bind(data.rc);
    if (data.acm) this.acm = new CaseAcmObject().bind(data.acm);
    // if (data.gh) this.gh = new CaseGhObject().bind(data.gh);
    return this;
  }

  bindPersonObject(personData) {
    this.personObject = new PersonEntity().bind(personData);
    return this;
  }

  bindPersonId(personId = '') {
    this.personId = personId;
    return this;
  }

  bindCompanyId(companyId = '') {
    this.companyId = companyId;
    return this;
  }

  bindBankBillSerialNumber(bankBillSerialNumber = null) {
    this.bankBillSerialNumber = bankBillSerialNumber;
    return this;
  }

  bindHc(hc = new CaseHcObject()) {
    this.hc = hc;
    return this;
  }

  bindDc(dc = new CaseDcObject()) {
    this.dc = dc;
    return this;
  }

  bindRc(rc = new CaseRcObject()) {
    this.rc = rc;
    return this;
  }

  bindAcm(acm = new CaseAcmObject()) {
    this.acm = acm;
    return this;
  }

  haveService() {
    return (this.dc && this.dc.valid)
    || (this.hc && this.hc.valid)
    || (this.acm && this.acm.valid)
    || (this.gh && this.gh.valid);
  }

  toView() {
    return {
      id: this.id,
      companyId: this.companyId,
      personId: this.personId,
      hc: (this.hc && this.hc.valid) ? this.hc.toView() : null,
      dc: (this.dc && this.dc.valid) ? this.dc.toView() : null,
      rc: (this.rc && this.rc.valid) ? this.rc.toView() : null,
      acm: (this.acm && this.acm.valid) ? this.acm.toView() : null,
      gh: (this.gh && this.gh.valid) ? this.gh.toView() : null,
      vn: this.__vn,
    };
  }
}

module.exports = CaseEntity;
