/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-case-html-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-07-08 11:29:56 am
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 * tag
 */

const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator, CustomRegex } = require('@erpv3/app-common/custom-tools');
const { coreErrorCodes, CasePlanHtmlObject } = require('../../../domain');

/**
* @class
* @classdesc inherit BaseBundle
*/
class UpdateCaseHtmlRequest extends BaseBundle {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
    * @type {string} tempFile
    * @description 暫存檔名
    * @member
    */
    this.tempFile = '';
    /**
    * @type {string} planStartDate
    * @description 生效日
    * @member
    */
    this.planStartDate = '';
    /**
    * @type {boolean} autoJudgeAA11
    * @description 自動判定個案身心障礙及失智症
    * @member
    */
    this.autoJudgeAA11 = false;
    /**
    * @type {object} basicInfo
    * @description 基本資料
    * @member
    */
    this.basicInfo = {};
    /**
    * @type {object} carePlan
    * @description 照顧計畫
    * @member
    */
    this.carePlan = {};
    /**
    * @type {object} evaluation
    * @description 個案評估
    * @member
    */
    this.evaluation = {};
  }

  bind(data) {
    super.bind(data, this);
    this.htmlData = new CasePlanHtmlObject.CasePlanHtmlObject().bind(this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.tempFile, coreErrorCodes.ERR_TEMP_FILE_IS_EMPTY)
      .checkThrows(this.planStartDate,
        { s: CustomValidator.strategies.NON_EMPTY_STRING, m: coreErrorCodes.ERR_PLAN_START_DATE_IS_EMPTY },
        { fn: (val) => CustomRegex.dateFormat(val), m: coreErrorCodes.ERR_PLAN_START_DATE_WRONG_FORMAT })
      .checkThrows(this.autoJudgeAA11,
        { s: CustomValidator.strategies.IS_BOOL, m: coreErrorCodes.ERR_AUTO_JUDGE_AA11_WRONG_FORMAT });
    return this;
  }
}

module.exports = UpdateCaseHtmlRequest;
