/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: review-update-status-multi-response.js
 * Project: @erpv3/backend
 * File Created: 2022-05-17 12:20:43 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

class ReviewUpdateStatusMultiResponse {
  constructor() {
    /**
    * @type {FormReviewStatusEntity[]}
    */
    this.data = null;
  }

  toView() {
    const resObject = {
      success: [],
      fail: [],
    };
    const { successList, failList } = this.data;
    for (const c of successList) {
      const obj = {
        sid: c.id,
        category: c.category,
        content: c.content,
        fillerName: c.fillerName,
      };
      resObject.success.push(obj);
    }
    for (const c of failList) {
      const obj = {
        sid: c.id,
        category: c.category ? c.category : '',
        content: c.content ? c.content : '',
        fillerName: c.fillerName ? c.fillerName : '',
        errorMessage: c.errorMessage,
      };
      resObject.fail.push(obj);
    }
    return resObject;
  }
}

module.exports = ReviewUpdateStatusMultiResponse;
