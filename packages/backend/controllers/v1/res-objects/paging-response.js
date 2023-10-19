/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: paging-response.js
 * Project: @erpv3/backend
 * File Created: 2022-03-15 03:39:22 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

/**
 * @class
 * @classdesc Describe paging response
 */
class PagingResponse {
  constructor() {
    /**
     * @type {number}
     */
    this.total = 0;
    /**
     * @type {Array<any>}
     */
    this.list = [];
  }

  /**
   * @description Check if total greater than 0
   * @returns {boolean} boolean
   */
  hasData() {
    return this.total > 0;
  }
}

module.exports = PagingResponse;
