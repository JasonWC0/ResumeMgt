/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: review-pending-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-04-22 04:44:33 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

class ReviewPendingListResponse {
  constructor() {
    /**
     * @type {FormReviewStatusEntity[]}
     */
    this.data = null;
  }

  toView() {
    const resArray = [];
    for (const c of this.data) {
      const obj = {
        sid: c.id,
        fid: c.fid,
        category: c.category,
        type: c.type,
        content: c.content,
        fillerName: c.fillerName,
        submittedAt: c.submittedAt,
        vn: c.__vn,
      };
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = ReviewPendingListResponse;
