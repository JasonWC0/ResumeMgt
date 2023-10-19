/**
 * FeaturePath: Common-Entity--個案SWOT分析圖
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
class CaseChartSWOTObject extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
     * @type {Object} swot
     * @description swot 分析
     * @member
     */
    this.swot = {};
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
      swot: this.swot,
    };
  }
}

module.exports = CaseChartSWOTObject;
