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
const { coreErrorCodes } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class ListCustomerRequest extends BaseBundle {
  constructor() {
    super();
    /**
     * @type {string} string
     * @description corportion id
     * @member
     */
    this.corpId = '';
    /**
     * @type {string} string
     * @description role type
     * @member
     */
    this.role = '';
    /**
     * @type {string} string
     * @description name
     * @member
     */
    this.name = '';
  }

  bind(data) {
    super.bind(data, this);
    return this;
  }

  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.corpId, coreErrorCodes.ERR_CORPORATION_ID_IS_EMPTY);
    return this;
  }
}

module.exports = ListCustomerRequest;
