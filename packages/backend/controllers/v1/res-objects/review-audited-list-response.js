/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: review-audited-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-04-22 05:17:15 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const PagingResponse = require('./paging-response');

class ReviewAuditedListResponse extends PagingResponse {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
    * @type { Number }
    */
    this.total = 0;
    /**
    * @type {FormReviewHistoryEntity[]}
    */
    this.data = null;
  }

  toView() {
    const _list = [];
    for (const c of this.data) {
      const obj = {
        hid: c.hid,
        fid: c.fid,
        category: c.category,
        type: c.type,
        content: c.content,
        fillerName: c.fillerName,
        status: c.status,
        submittedAt: c.submittedAt,
      };
      _list.push(obj);
    }

    return {
      total: this.total,
      list: _list,
    };
  }
}

module.exports = ReviewAuditedListResponse;
