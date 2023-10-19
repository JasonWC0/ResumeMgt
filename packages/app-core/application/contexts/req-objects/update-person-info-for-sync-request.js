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
const { coreErrorCodes } = require('../../../domain');
const UpdatePersonRequest = require('./update-person-info-request');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class UpdatePersonForSyncRequest extends UpdatePersonRequest {
  /**
   * @constructor
   */
  constructor() {
    super();
    this.corpId = null;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    super.checkRequired();
    if (this.corpId !== null) {
      CustomValidator
        .nonEmptyString(this.corpId, coreErrorCodes.ERR_CORPORATION_ID_IS_EMPTY);
    }
    return this;
  }
}

module.exports = UpdatePersonForSyncRequest;
