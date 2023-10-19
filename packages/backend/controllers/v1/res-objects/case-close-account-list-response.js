/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-close-account-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-12-04 09:22:25 pm
 * Author: AndyH Lai (andyh_lai@compal.com)
 */

const PagingResponse = require('./paging-response');

/**
 * @class
 * @classdesc Describe form result list response
 * @extends PagingResponse
 */
class CaseCloseAccounttListResponse extends PagingResponse {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
      * @type {CaseContractEntity[]}
      */
    this.data = [];
    /**
      * @type {Number}
      */
    this.total = 0;
  }

  toView() {
    const _list = [];
    this.data.forEach((value) => {
      _list.push({
        caseId: value.caseId,
        serviceCategory: value.serviceCategory,
        name: value.name,
        supervisorName: value.supervisorName,
        masterHomeservicerName: value.masterHomeservicerName,
        personalId: value.personalId,
        area: value.area,
        gender: value.gender,
        reliefType: value.reliefType,
        status: value.status,
      });
    });

    return {
      total: this.total,
      list: _list,
    };
  }
}

module.exports = CaseCloseAccounttListResponse;
