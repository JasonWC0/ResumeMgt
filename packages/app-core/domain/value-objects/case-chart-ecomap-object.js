/**
 * FeaturePath: Common-Entity--個案生態圖物件
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');

/**
 * @class
 * @classdesc Represents contact object
 */
class CaseChartEcomapObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {Number} other
     * @description 圖形序號
     * @member
     */
    this.id = 0;
    /**
     * @type {string} name
     * @description 姓名或機構
     * @member
     */
    this.name = null;
    /**
     * @type {Boolean} connected
     * @description 與個案連結
     * @member
     */
    this.connected = false;
    /**
     * @type {string} direction
     * @description 資源互動方向
     * @member
     */
    this.direction = '';
    /**
     * @type {Boolean} conflict
     * @description 衝突、壓力關係
     * @member
     */
    this.conflict = false;
    /**
     * @type {string} other
     * @description 其他
     * @member
     */
    this.other = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
  * @method
  * @description Return formated info
  * @returns {Object}
  */
  toView() {
    return {
      id: this.id,
      name: this.name,
      connected: this.connected,
      direction: this.direction,
      conflict: this.conflict,
      other: this.other,
    };
  }
}

module.exports = CaseChartEcomapObject;
