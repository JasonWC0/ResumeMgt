/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const {
  FileObject,
  coreErrorCodes,
  caseChartCategoryCodes,
  CaseChartEntity,
} = require('../../../domain');

/**
 * @class
 * @classdesc inherit CaseChartEntity
 */
class CreateCaseChartRequest extends CaseChartEntity {
  bind(data) {
    super.bind(data);
    if (data.chart) this.chart = new FileObject().bind(data.chart).updateTime();
    if (data.relationChart) this.relationChart = new FileObject().bind(data.relationChart).updateTime();
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.caseId, coreErrorCodes.ERR_CASE_ID_IS_EMPTY)
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
      .isNumberThrows(this.category, coreErrorCodes.ERR_CASE_CHART_CATEGORY_IS_EMPTY)
      .checkThrows(this.category, {
        fn: (c) => Object.values(caseChartCategoryCodes).includes(c),
        m: coreErrorCodes.ERR_CASE_CHART_CATEGORY_WRONG_VALUE,
      });
    if (this.chart) new CustomValidator().checkThrows(this.chart.checkRequired());
    if (this.relationChart) new CustomValidator().checkThrows(this.relationChart.checkRequired());

    return this;
  }
}

module.exports = CreateCaseChartRequest;
