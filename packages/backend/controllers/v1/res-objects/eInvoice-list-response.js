/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: eInvoice-list-response.js
 * Project: @erpv3/backend
 * File Created: 2023-03-08 03:01:56 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const PagingResponse = require('./paging-response');

/**
 * @class
 * @classdesc Describe form result list response
 * @extends PagingResponse
 */
class EInvoiceListResponse extends PagingResponse {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
     * @type {FormResultEntity[]}
     */
    this.data = [];
    /**
     * @type {FormReviewStatusEntity[]}
     */
    this.formReviewStatus = [];
    /**
     * @type { Number }
     */
    this.total = 0;
    /**
     * @type { Boolean }
     */
    this.detail = false;
    /**
     * @type { String }
     */
    this.pick = '';
  }

  toView() {
    const _list = [];
    this.data.forEach((value) => {
      const obj = {
        id: value._id,
        caseName: value.caseName,
        serialString: value.serialString,
        paidDate: null, // TODO
        invoiceNumber: value?.invoiceNumber || '',
        issuedDate: value?.issuedDate || null,
        identifier: value?.identifier || '',
        items: value.items,
        note: value?.note || '',
        status: value.status,
        allowanceList: [], // TODO
      };
      _list.push(obj);
    });

    return {
      total: this.total,
      list: _list,
    };
  }
}

module.exports = EInvoiceListResponse;
