/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: case-status-history-list-response.js
 * Project: @erpv3/backend
 * File Created: 2022-10-05 11:24:27 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

class CaseStatusHistoryListResponse {
  constructor() {
    /**
     * @type {Array<CaseServiceStatus>}
     */
    this.hc = [];
    /**
     * @type {Array<CaseServiceStatus>}
     */
    this.dc = [];
    /**
     * @type {Array<CaseServiceStatus>}
     */
    this.rc = [];
  }

  toView() {
    return {
      HC: this.hc,
      DC: this.dc,
      RC: this.rc,
    };
  }
}

module.exports = CaseStatusHistoryListResponse;
