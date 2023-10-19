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
  CaseHcObject,
  CaseDcObject,
  CaseRcObject,
  CaseAcmObject,
} = require('../../../domain');
/**
* @class
* @classdesc inherit UpdateReviewRequest
*/
class UpdateCaseServiceRequest extends BaseBundle {
  /**
  * @constructor
  */
  constructor() {
    super();
    /**
    * @type {object} dataObj
    * @description String Object
    * @member
    */
    this.dataObj = {};
    /**
    * @type {CaseHcObject} hc
    * @description 案號
    * @member
    */
    this.hc = null;
    /**
    * @type {CaseRcObject} dc
    * @description 案號
    * @member
    */
    this.dc = null;
    /**
    * @type {CaseDcObject} rc
    * @description 案號
    * @member
    */
    this.rc = null;
    /**
    * @type {CaseAcmObject} acm
    * @description 案號
    * @member
    */
    this.acm = null;
  }

  bind(data = {}) {
    this.dataObj = data;

    if (CustomValidator.nonEmptyObject(data.hc)) this.hc = new CaseHcObject().bind(data.hc);
    if (CustomValidator.nonEmptyObject(data.dc)) this.dc = new CaseDcObject().bind(data.dc);
    if (CustomValidator.nonEmptyObject(data.rc)) this.rc = new CaseRcObject().bind(data.rc);
    if (CustomValidator.nonEmptyObject(data.acm)) this.acm = new CaseAcmObject().bind(data.acm);
    return this;
  }
}

module.exports = UpdateCaseServiceRequest;
