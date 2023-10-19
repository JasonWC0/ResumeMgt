/**
 * FeaturePath: Common-Entity--照顧計畫其他未支援服務項目
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

class OtherServiceItemObject extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} item
     * @description 服務項目內容
     * @member {string}
     */
    this.item = '';
    /**
     * @type {number} amount
     * @description 服務數量
     * @member {number}
     */
    this.amount = null;
    /**
     * @type {number} price
     * @description 金額
     * @member {number}
     */
    this.price = null;
    /**
     * @type {number} total
     * @description 總額(小計)
     * @member {number}
     */
    this.total = null;
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }
}

module.exports = OtherServiceItemObject;
