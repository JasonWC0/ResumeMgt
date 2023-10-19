/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2023 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-result-case-newest-list-response.js
 * Project: @erpv3/backend
 * File Created: 2023-03-01 11:40:39 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

class NewestFormResultGroupByCaseListResponse {
  /**
 * @constructor
 */
  constructor() {
    /**
     * @type {Object[]}
     */
    this.list = [];
  }

  toView() {
    const resArray = [];
    for (const c of this.list) {
      const obj = {
        caseId: c._id,
        list: c.list.map((d) => ({
          category: d.category,
          type: d.type,
          fillDate: d.fillDate,
          nextFillDate: d.nextEvaluationDate,
        })),
      };
      resArray.push(obj);
    }
    return resArray;
  }
}

module.exports = NewestFormResultGroupByCaseListResponse;
