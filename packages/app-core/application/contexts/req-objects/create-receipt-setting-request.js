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
const {
  coreErrorCodes,
  receiptSettingContentTypeCodes,
  FileObject,
} = require('../../../domain');

/**
 * @class
 * @classdesc inherit BaseBoundle
 */
class CreateReceiptSettingRequest extends BaseBundle {
  /**
   * @constructor
   */
  constructor() {
    super();
    /**
    * @type {String} companyId
    * @description company ID
    * @member
    */
    this.companyId = '';
    /**
    * @type {receiptSettingContentTypeCodes} contentType
    * @description receipt setting type
    * @member
    */
    this.contentType = null;
    /**
    * @type {String} pos
    * @description String
    * @member
    */
    this.pos = null;
    /**
    * @type {String} text
    * @description String
    * @member
    */
    this.text = '';
    /**
    * @type {FileObject} photo
    * @description file
    * @member
    */
    this.photo = null;
    /**
    * @type {String} url
    * @description String
    * @member
    */
    this.url = '';
    /**
   * @type {String} note
   * @description String
   * @member
   */
    this.note = '';
    /**
    * @type {String} reportType
    * @description String
    * @member
    */
    this.reportType = '';
  }

  bind(data = {}) {
    super.bind(data, this);
    if (data.photo) {
      this.photo = new FileObject().bind(data.photo);
    }
    return this;
  }

  /**
   * @function
   * @description 確認是否有空白、格式
   */
  checkRequired() {
    new CustomValidator()
      .nonEmptyStringThrows(this.companyId, coreErrorCodes.ERR_COMPANY_ID_EMPTY)
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

module.exports = CreateReceiptSettingRequest;
