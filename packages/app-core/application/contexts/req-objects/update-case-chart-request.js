/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { FileObject } = require('../../../domain');

/**
 * @class
 * @classdesc inherit CaseChartEntity
 */
class UpdateCaseChartRequest extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {FileObject} chart
     * @description 圖檔
     * @member
     */
    this.chart = null;
    /**
     * @type {String} maker
     * @description 填寫人
     * @member
     */
    this.maker = '';
    /**
     * @type {String} makeDate
     * @description 填寫日期
     * @member
     */
    this.makeDate = '';
    /**
     * @type {FileObject} relationChart
     * @description 引入家系圖檔案
     * @member
     */
    this.relationChart = null;
    /**
     * @type {Array<Object>} structureChart
     * @description 圖表結構
     * @member
     */
    this.structureChart = [];
    /**
     * @type {Boolean} isTemp
     * @description 是否為暫存
     * @member
     */
    this.isTemp = false;
    /**
     * @type {Boolean} isDraw
     * @description 是否已畫個案同住
     * @member
     */
    this.isDraw = false;
  }

  bind(data) {
    super.bind(data, this);
    if (data.chart) this.chart = new FileObject().bind(data.chart);
    if (data.relationChart) this.relationChart = new FileObject().bind(data.relationChart);
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    if (this.chart) new CustomValidator().checkThrows(this.chart.checkRequired());
    if (this.relationChart) new CustomValidator().checkThrows(this.relationChart.checkRequired());

    return this;
  }
}

module.exports = UpdateCaseChartRequest;
