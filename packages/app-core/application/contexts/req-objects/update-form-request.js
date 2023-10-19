/**
 * FeaturePath: 待移除---
 * Accountable: JoyceS Hsu, AndyH Lai
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 *
 * File: update-form-request.js
 * Project: @erpv3/app-core
 * File Created: 2022-03-08 02:06:57 pm
 * Author: JoyceS Hsu (joyces_hsu@compal.com)
 */

const { models } = require('@erpv3/app-common');
const { BaseBundle } = require('@erpv3/app-common/custom-models');
const { CustomValidator } = require('@erpv3/app-common/custom-tools');
const {
  coreErrorCodes, formReviewTypeCodes, companyServiceCodes, employeeRoleCodes,
} = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBundle
 */
class UpdateFormRequest extends BaseBundle {
  /**
 * @constructor
 */
  constructor() {
    super();
    /**
     * @type {array} serviceTypes
     * @description 服務類別
     * @member
     */
    this.serviceTypes = [];
    /**
     * @type {string} name
     * @description 表單名稱
     * @member
     */
    this.name = '';
    /**
     * @type {number} reviewType
     * @description 表單審核類別
     * @member
     */
    this.reviewType = null;
    /**
     * @type {array} reviewRoles
     * @description 表單審核角色
     * @member
     */
    this.reviewRoles = [];
    /**
     * @type {string} frequency
     * @description 表單頻率
     * @member
     */
    this.frequency = '';
    /**
     * @type {string} displayGroup
     * @description 日照選單分類
     * @member
     */
    this.displayGroup = '';
    /**
     * @type {array} fillRoles
     * @description 填表角色(for 相容1.5)
     * @member
     */
    this.fillRoles = [];
    /**
     * @type {array} viewRoles
     * @description 檢視角色(for 相容1.5)
     * @member
     */
    this.viewRoles = [];
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .checkThrows(this.serviceTypes,
        { s: CustomValidator.strategies.NON_EMPTY_ARRAY, m: coreErrorCodes.ERR_FORM_SERVICE_TYPE_IS_EMPTY })
      .nonEmptyStringThrows(this.name, coreErrorCodes.ERR_FORM_NAME_IS_EMPTY)
      .checkThrows(this.reviewType,
        { s: CustomValidator.strategies.IS_NUM, m: coreErrorCodes.ERR_FORM_REVIEW_TYPE_IS_EMPTY },
        { fn: (val) => Object.values(formReviewTypeCodes).includes(val), m: coreErrorCodes.ERR_FORM_REVIEW_TYPE_NOT_EXIST });

    for (const _type of this.serviceTypes) {
      if (!Object.values(companyServiceCodes).includes(_type)) {
        throw new models.CustomError(coreErrorCodes.ERR_FORM_SERVICE_TYPE_CODE_NOT_EXIST);
      }
    }

    if (this.reviewType !== formReviewTypeCodes.none && !CustomValidator.nonEmptyArray(this.reviewRoles)) {
      throw new models.CustomError(coreErrorCodes.ERR_FORM_REVIEW_ROLES_IS_EMPTY);
    }
    // eslint-disable-next-line prefer-spread
    const flatReviewRoles = [].concat.apply([], this.reviewRoles);
    for (const _role of flatReviewRoles) {
      if (!Object.values(employeeRoleCodes).includes(_role)) {
        throw new models.CustomError(coreErrorCodes.ERR_FORM_REVIEW_ROLES_NOT_EXIST);
      }
    }
    return this;
  }
}

module.exports = UpdateFormRequest;
