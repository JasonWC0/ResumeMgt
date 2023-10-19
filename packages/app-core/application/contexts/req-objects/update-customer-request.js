/**
 * FeaturePath: 待移除---
 * Accountable: AndyH Lai, JoyceS Hsu
 *
 * (C) Copyright 2022 Compal Electronics, Inc.
 *
 * This software is the property of Compal Electronics, Inc.
 * You have to accept the terms in the license file before use.
 */

const { CustomUtils } = require('@erpv3/app-common/custom-tools');
const { CustomerObject } = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class UpdateCustomerRequest extends CustomerObject {
  constructor() {
    super();
    /**
     * @type {object} dataObj
     * @description base64 String to Object
     * @member
     */
    this.dataObj = {};
  }

  bind(data = {}) {
    super.bind(data, this);
    this.dataObj = CustomUtils.deepCopy(data);
    return this;
  }
}

module.exports = UpdateCustomerRequest;
