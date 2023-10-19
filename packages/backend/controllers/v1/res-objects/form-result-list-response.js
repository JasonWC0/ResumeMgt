/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: form-result-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-03-15 03:38:45 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const PagingResponse = require('./paging-response');

/**
 * @class
 * @classdesc Describe form result list response
 * @extends PagingResponse
 */
class FormResultListResponse extends PagingResponse {
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
    // bind formReviewStatus
    const _list = [];
    this.data.forEach((value, index, array) => {
      for (const statusData of this.formReviewStatus) {
        if (statusData.fid.toString() !== value.id) { continue; }

        const obj = {
          fid: value.id,
          formId: value.formIdStr,
          version: value?.formId?.version || undefined,
          type: value.type,
          fillDate: value.fillDate,
          fillerName: value.filler.name,
          files: value.files,
          reviewerName: statusData.lastReviewerName ? statusData.lastReviewerName : '',
          reviewStatus: statusData.status ? statusData.status : null,
          reviewComment: statusData.comment ? statusData.comment : '',
          submittedAt: value.submittedAt,
          vn: value.__vn,
        };
        if (this.detail) {
          obj.caseId = value.caseId;
          obj.category = value.category;
          obj.fillerPersonId = value.filler.personId;
          obj.nextEvaluationDate = value.nextEvaluationDate;
          obj.result = value.result;
        }
        if (this.pick !== '') {
          const layers = this.pick.split('.');
          let takeObj = value.result;
          for (let i = 0; i < layers.length; i++) {
            takeObj = Object.keys(takeObj).includes(layers[i]) ? takeObj[layers[i]] : null;
            if (!takeObj) { break; }
          }
          obj.pick = takeObj || null;
        }
        _list.push(obj);

        array[index].reviewerName = statusData.lastReviewerName;
        array[index].reviewStatus = statusData.status;
        array[index].reviewComment = statusData.comment;
      }
    });

    return {
      total: this.total,
      list: _list,
    };
  }
}

module.exports = FormResultListResponse;
