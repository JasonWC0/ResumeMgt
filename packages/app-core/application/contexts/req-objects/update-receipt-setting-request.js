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
  coreErrorCodes,
  receiptSettingContentTypeCodes,
} = require('../../../domain');
const CreateReceiptSettingRequest = require('./create-receipt-setting-request');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class UpdateReceiptSettingRequest extends CreateReceiptSettingRequest {
  /**
   * @constructor
   */
  constructor() {
    super();
    delete this.companyId;
  }

  bind(data = {}) {
    super.bind(data);
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    new CustomValidator()
      .checkThrows(this.contentType,
        { m: coreErrorCodes.ERR_RECEIPT_SETTING_CONTENT_TYPE_NOT_EXIST, fn: (val) => Object.values(receiptSettingContentTypeCodes).includes(val) })
      .nonEmptyStringThrows(this.pos, coreErrorCodes.ERR_RECEIPT_SETTING_POS_EMPTY)
      .nonEmptyStringThrows(this.reportType, coreErrorCodes.ERR_RECEIPT_SETTING_REPORT_TYPE_EMPTY);

    switch (this.contentType) {
      case receiptSettingContentTypeCodes.text:
        new CustomValidator().nonEmptyStringThrows(this.text, coreErrorCodes.ERR_RECEIPT_SETTING_TEXT_EMPTY);
        break;
      case receiptSettingContentTypeCodes.photo:
        new CustomValidator().checkThrows(this.photo, { m: coreErrorCodes.ERR_RECEIPT_SETTING_PHOTO_EMPTY, fn: (val) => val });
        this.photo.checkRequired();
        break;
      default:
        break;
    }
    return this;
  }
}

module.exports = UpdateReceiptSettingRequest;
