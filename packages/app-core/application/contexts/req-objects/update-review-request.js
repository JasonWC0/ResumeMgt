/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-review-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-05-17 02:43:51 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models } = require('@erpv3/app-common');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { coreErrorCodes, formReviewTypeCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class UpdateReviewRequest extends BaseBundle {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
   * @type {number} formReviewType
   * @description 表單審核類型
   * @member
   */
    this.formReviewType = null;
    /**
   * @type {array} reviewRoles
   * @description 審核角色列表
   * @member
   */
    this.reviewRoles = [];
    /**
   * @type {array} reviewers
   * @description 審核人員工列表
   * @member
   */
    this.reviewers = [];
    /**
   * @type {string} fillerName
   * @description 填表人姓名
   * @member
   */
    this.fillerName = '';
    /**
   * @type {object} submitter
   * @description 送單者
   * @member
   */
    this.submitter = {
      personId: '',
      name: '',
    };
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  /**
 * @function
 * @description 確認是否有空白
 */
  checkRequired() {
    new CustomValidator()
      .checkThrows(this.formReviewType,
        { fn: (val) => CustomValidator.isNumber(val), m: coreErrorCodes.ERR_FORM_REVIEW_TYPE_IS_EMPTY },
        { fn: (val) => Object.values(formReviewTypeCodes).includes(val), m: coreErrorCodes.ERR_FORM_REVIEW_TYPE_NOT_EXIST })
      .nonEmptyStringThrows(this.fillerName, coreErrorCodes.ERR_FILLER_NAME_IS_EMPTY)
      .nonEmptyStringThrows(this.submitter.personId, coreErrorCodes.ERR_SUBMITTER_PERSON_ID_IS_EMPTY)
      .nonEmptyStringThrows(this.submitter.name, coreErrorCodes.ERR_SUBMITTER_NAME_IS_EMPTY);

    if (this.formReviewType !== formReviewTypeCodes.none) {
      if (!CustomValidator.nonEmptyArray(this.reviewRoles) && !CustomValidator.nonEmptyArray(this.reviewers)) {
        throw new models.CustomError(coreErrorCodes.ERR_REVIEWROLES_AND_REVIEWERS_ARE_EMPTY);
      }
    }

    if (CustomValidator.nonEmptyArray(this.reviewRoles)) {
      this.reviewRoles.forEach((layerItem) => {
        CustomValidator.nonEmptyArray(layerItem, coreErrorCodes.ERR_REVIEWROLES_WRONG_FORMAT);
      });
    }
    return this;
  }
}

module.exports = UpdateReviewRequest;
