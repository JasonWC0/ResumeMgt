/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: review-history-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-04-22 03:39:26 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

class ReviewHistoryListResponse {
  constructor() {
    /**
     * @type {FormReviewHistoryEntity[]}
     */
    this.data = null;
  }

  toView() {
    const resArray = [];
    for (const c of this.data) {
      const obj = {
        hid: c.hid,
        personId: c.submitter ? c.submitter.personId : '',
        name: c.submitter ? c.submitter.name : '',
        status: c.status,
        comment: c.comment,
        submittedAt: c.submittedAt,
      };
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = ReviewHistoryListResponse;
