/**
 * FeaturePath: Common-Entity--個案圖資
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const BaseEntity = require('./base-entity');
const CaseChartCategoryCodes = require('../enums/case-chart-category-codes');
const CaseChartEcomapObject = require('../value-objects/case-chart-ecomap-object');
const CaseChartGenogramObject = require('../value-objects/case-chart-genogram-object');
const CaseChartSWOTObject = require('../value-objects/case-chart-swot-object');
const FileObject = require('../value-objects/file-object');

class CaseChartEntity extends BaseEntity {
  constructor() {
    super();
    /**
     * @type {String} caseId
     * @description 個案id
     * @member
     */
    this.caseId = '';
    /**
     * @type {String} companyId
     * @description 公司id
     * @member
     */
    this.companyId = '';
    /**
     * @type {Number} category
     * @description 圖表種類
     * @member
     */
    this.category = null;
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
    super.bind(data);
    if (data.structureChart) {
      switch (this.category) {
        case CaseChartCategoryCodes.genogram:
          this.structureChart = data.structureChart.map((c) => new CaseChartGenogramObject().bind(c));
          break;
        case CaseChartCategoryCodes.ecomap:
          this.structureChart = data.structureChart.map((c) => new CaseChartEcomapObject().bind(c));
          break;
        case CaseChartCategoryCodes.swot:
          this.structureChart = data.structureChart.map((c) => new CaseChartSWOTObject().bind(c));
          break;
        default:
          break;
      }
    }
    if (data.createdAt) this.createdAt = data.createdAt;
    return this;
  }

  bindChart(chart) {
    this.chart = new FileObject().bind(chart);
    return this;
  }

  bindRelationChart(relationChart) {
    this.relationChart = new FileObject().bind(relationChart);
    return this;
  }

  bindRefer(refer) {
    this.refer = refer;
    return this;
  }

  toView() {
    return {
      id: this.id,
      caseId: this.caseId,
      companyId: this.companyId,
      category: this.category,
      chart: this.chart,
      maker: this.maker,
      makeDate: this.makeDate,
      relationChart: this.relationChart,
      structureChart: this.structureChart.map((s) => s.toView()),
      isTemp: this.isTemp,
      isDraw: this.isDraw,
      vn: this.__vn,
      createdAt: this.createdAt,
    };
  }
}

module.exports = CaseChartEntity;
