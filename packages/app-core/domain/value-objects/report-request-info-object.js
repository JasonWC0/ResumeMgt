/**
 * FeaturePath: Common-Entity--報表Request內容物件
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: report-request-info-object.js
 * Project: @erpv3/app-core
 * File Created: 2022-09-06 10:27:28 am
 * Author: Joyce Hsu (joyces_hsu@compal.com)
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class ReportRequestInfoObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} url
     * @description api/url
     * @member {string}
     */
    this.url = '';
    /**
     * @type {object} body
     * @description body內容
     * @member {object}
     */
    this.body = {};
    /**
     * @type {string} personId
     * @description 登入操作者的人員Id
     * @member {string}
     */
    this.personId = '';
    /**
     * @type {string} companyId
     * @description 登入操作者的公司Id
     * @member {string}
     */
    this.companyId = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = ReportRequestInfoObject;
