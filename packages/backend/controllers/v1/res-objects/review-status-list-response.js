/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: review-status-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-05-17 04:49:49 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

class ReviewStatusListResponse {
  constructor() {
    /**
    * @type {Array<FormReviewStatusEntity>}
    */
    this.list = [];
  }

  toView() {
    const resArray = [];
    for (const c of this.list) {
      const obj = {
        sid: c.id,
        fid: c.fid,
        category: c.category,
        type: c.type,
        status: c.status,
        comment: c.comment,
        lastReviewerName: c.lastReviewerName,
        submittedAt: c.submittedAt,
        vn: c.__vn,
      };
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = ReviewStatusListResponse;
